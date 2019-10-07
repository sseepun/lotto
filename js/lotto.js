Number.prototype.pad = function(size){
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}
Number.prototype.moneyFormat = function(){
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateMoneyChart(period, money){
    if(window.moneyChart!==undefined){
        window.moneyChartData.labels.push(period);
        if(period>18) window.moneyChartData.labels.shift();

        for(let i=0; i<window.moneyChartData.datasets.length; ++i){
            if(typeof window.moneyChartData.datasets[i].data[0] === 'object'){
                window.moneyChartData.datasets[i].data.push({
                    x: period, y: money
                });
            }else{
                window.moneyChartData.datasets[i].data.push(money);
            }
            if(period>18) window.moneyChartData.datasets[i].data.shift();
        }

        window.moneyChart.update();
    }
}
function updateLotteryNumChart(period, lotteryNum){
    if(window.lotteryNumChart!==undefined){
        window.lotteryNumChartData.labels.push(period);
        if(period>18) window.lotteryNumChartData.labels.shift();

        for(let i=0; i<window.lotteryNumChartData.datasets.length; ++i){
            if(typeof window.lotteryNumChartData.datasets[i].data[0] === 'object'){
                window.lotteryNumChartData.datasets[i].data.push({
                    x: period, y: lotteryNum
                });
            }else{
                window.lotteryNumChartData.datasets[i].data.push(lotteryNum);
            }
            if(period>18) window.lotteryNumChartData.datasets[i].data.shift();
        }

        window.lotteryNumChart.update();
    }
}
function updateWonChart(period, won){
    if(window.wonChart!==undefined){
        window.wonChartData.labels.push(period);
        if(period>18) window.wonChartData.labels.shift();

        for(let i=0; i<window.wonChartData.datasets.length; ++i){
            if(typeof window.wonChartData.datasets[i].data[0] === 'object'){
                window.wonChartData.datasets[i].data.push({
                    x: period, y: won
                });
            }else{
                window.wonChartData.datasets[i].data.push(won);
            }
            if(period>18) window.wonChartData.datasets[i].data.shift();
        }

        window.wonChart.update();
    }
}
function updateRatioDonut(won, spent){
    if(window.ratioDonut!==undefined){
        for(let i=0; i<window.ratioDonutData.datasets.length; ++i){
            window.ratioDonutData.datasets[i].data[0] += won;
            window.ratioDonutData.datasets[i].data[1] += spent;
        }
        window.ratioDonut.update();
    }
}

class Lottor {
    constructor(hand, money){
        this.hand = $(hand);
        this.money = money;
        this.lotteries = [];

        this.moneyHistory = [money];
        this.lotteryNumHistory = [];
        this.wonHistory = [];

        this.updateReport();
    }

    lotteryCount(){return this.lotteries.length;}
    getLottery(index){return this.lotteries[index];}

    pick(lottery){
        if(this.money < lottery.price){
            if(this.lotteryCount() > 0){
                $('#broke-last-chance-modal').addClass('fancybox-is-open').show();
                $('#broke-last-chance-modal .fancybox-content')
                    .addClass('fadeInDown').removeClass('fadeOutUp');
            }else if(!$('#broke-modal').hasClass('fancybox-is-open')){
                let total_prize = this.getTotalPrize();
                $('.broke-title').html('เงินของคุณ...หมดแล้ว...');
                $('#broke-modal').addClass('fancybox-is-open').show();
                $('#broke-modal .fancybox-content').removeClass('fadeOutUp').addClass('fadeInDown');
                $('#total_prize').val(total_prize);
                $('.total_prize').html(total_prize.moneyFormat());
            }
            return false;
        }else{
            this.money -= lottery.price;
            this.lotteries.push(lottery);
            this.updateReport();

            let self = this;
            setTimeout(function(){
                lottery.onLottor(self.hand);
            }, 700);
            return true;
        }
    }

    getTotalPrize(){
        let total = 0;
        for(let i=0; i<this.wonHistory.length; i++) total += this.wonHistory[i];
        return total;
    }

    updateReport(){
        $('#money').html(this.money.moneyFormat());
        $('.lottery-num').html(this.lotteryCount());
    }

    nextPeriod(wonPrizes){
        let won = 0;
        for(let i=0; i<wonPrizes.length; i++) won += wonPrizes[i].prize;

        let spent = 0;
        if(this.lotteries.length>0) spent += this.lotteries.length * this.lotteries[0].price;

        this.moneyHistory.push(this.money + won);
        this.lotteryNumHistory.push(this.lotteries.length);
        this.wonHistory.push(won);

        updateMoneyChart(this.moneyHistory.length, this.money + won);
        updateLotteryNumChart(this.lotteryNumHistory.length, this.lotteries.length);
        updateWonChart(this.wonHistory.length, won);
        updateRatioDonut(won, spent);

        updateLottoDatabase(this.moneyHistory, this.lotteryNumHistory, this.wonHistory);

        this.lotteries = [];
        this.hand.html('');
        this.money += won;

        this.updateReport();
    }
}
class Lottery {
    constructor(){
        let rand_list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            rand_length = rand_list.length,
            id = '';
        for(let i=0; i<12; i++) id += rand_list[Math.round(Math.random() * (rand_length - 1))];
        
        this.id = id;
        this.price = 80;
        this.on_panel = false;
        this.panel_index = -1;
        
        this.number = (Math.round(Math.random() * 999999)).pad(6);
        this.head = this.number.substr(0, 3);
        this.tail = this.number.substr(3, 3);
        this.two = this.number.substr(4, 2);
    }
    info(){console.log(this);}

    numberDisplay(){
        let nt = ['ZER', 'ONE', 'TWO', 'THR', 'FOU', 'FIV', 'SIX', 'SEV', 'EIG', 'NIN'],
            html = '';
        for(let i=0; i<6; i++){
            html += '<div class="num">'+this.number[i]+'<br><span>'+nt[Number(this.number[i])]+'</span></div>';
        }
        return html;
    }

    onPanel(panel){
        if(!this.on_panel){
            this.on_panel = true;
            panel.append(
                '<div class="lottery" lottery-id="'+this.id+'">'
                    +'<div class="wrapper"><div style="float:right">'
                        +this.numberDisplay()
                    +'</div></div>'
                +'</div>'
            );
        }
    }

    onLottor(hand){
        if(this.on_panel){
            this.on_panel = false;
            hand.append(
                '<div class="lottery">'
                    +this.numberDisplay()
                +'</div>'
            );
        }
    }
}
class LotteryPrize {
    constructor(prize_space, period){
        this.prize_space = $(prize_space);
        this.prize_space.html('');
        this.period = period;

        this.prizes = [];
        this.prizeWons = [];
        $('#prize-summary-modal .summary').html('');
    }

    nextPeriod(lottor){
        $('.lottery-prize-container').removeClass('active');
        lottor.nextPeriod(this.prizeWons);

        this.period += 1;
        this.prizes = [];
        this.prizeWons = [];

        let self = this;
        setTimeout(function(){
            self.prize_space.html('');
            $('#prize-summary-modal .summary').html('');
        }, 600);
    }

    generate(lottor){
        $('.lottery-prize-container').addClass('active');

        let first = Math.round(Math.random() * 999998) + 1,
            numbers = [first.pad(6), (first-1).pad(6), (first+1).pad(6)],
            threes = [];

        while(threes.length < 4){
            let temp = (Math.round(Math.random() * 999)).pad(3);
            if(threes.indexOf(temp)==-1) threes.push(temp);
        }

        while(numbers.length < 168){
            let temp = (Math.round(Math.random() * 999999)).pad(6);
            if(numbers.indexOf(temp)==-1){
                numbers.push(temp);
                if(numbers.length == 168){
                    this.generatePrizes(lottor, numbers, threes);
                    break;
                }
            }
        }
    }

    generatePrizes(lottor, numbers, threes){
        let two = (Math.round(Math.random() * 99)).pad(2);
        this.prizes = [
            {id: 1, prize_name: 'รางวัลที่ 1', prize: 6000000, numbers: [numbers[0]]},
            {id: 2, prize_name: 'เลขหน้า 3 ตัว', prize: 4000, numbers: threes.slice(0, 2)},
            {id: 3, prize_name: 'เลขท้าย 3 ตัว', prize: 4000, numbers: threes.slice(2, 4)},
            {id: 4, prize_name: 'เลขท้าย 2 ตัว', prize: 2000, numbers: two},
            {id: 5, prize_name: 'รางวัลข้างเคียงรางวัลที่ 1', prize: 100000, numbers: numbers.slice(1, 3)},
            {id: 6, prize_name: 'รางวัลที่ 2', prize: 200000, numbers: numbers.slice(3, 8)},
            {id: 7, prize_name: 'รางวัลที่ 3', prize: 80000, numbers: numbers.slice(8, 18)},
            {id: 8, prize_name: 'รางวัลที่ 4', prize: 40000, numbers: numbers.slice(18, 68)},
            {id: 9, prize_name: 'รางวัลที่ 5', prize: 20000, numbers: numbers.slice(68, 168)}
        ];

        
        let html = '<div class="formatted" style="text-align:center;">'
            +'<div class="delimeter-md"></div>'
            +'<h1>ผล CC ลอตเตอรี่ <span>งวดที่ '+this.period+'</span></h1>';

        html += '<div class="btn-container" style="text-align:center; margin-bottom:20px;">'
            +'<a href="#" class="btn btn-primary lottery-prize-summary" style="float:none;" '
            +'data-fancybox="" data-animation-duration="300" data-src="#prize-summary-modal">สรุปผลงวดนี้ !</a>'
        +'</div>';

        html += '<div class="table-wrapper">';

        html += '<table class="big-prize-table">'
            +'<tr>'
                +'<th><span>รางวัลที่ 1</span><br>รางวัลละ 6,000,000 บาท</th>'
                +'<th><span>เลขหน้า 3 ตัว</span><br>รางวัลละ 4,000 บาท</th>'
                +'<th><span>เลขท้าย 3 ตัว</span><br>รางวัลละ 4,000 บาท</th>'
                +'<th><span>เลขท้าย 2 ตัว</span><br>รางวัลละ 2,000 บาท</th>'
            +'</tr>'
            +'<tr>'
                +'<td><h3><span>'+numbers[0]+'</span></h3></td>'
                +'<td><h4>'+threes[0]+'&nbsp;&nbsp;&nbsp;'+threes[1]+'</h4></td>'
                +'<td><h4>'+threes[2]+'&nbsp;&nbsp;&nbsp;'+threes[3]+'</h4></td>'
                +'<td><h4>'+two+'</h4></td>'
            +'</tr>'
        +'</table>';

        html += '<table>'
            +'<tr>'
                +'<th><span>รางวัลข้างเคียงรางวัลที่ 1</span><br>รางวัลละ 100,000 บาท</th>'
                +'<td><h4>'+numbers[1]+'</h4></td>'
                +'<td><h4>'+numbers[2]+'</h4></td>'
            +'</tr>'
        +'</table>';

        html += '<table class="prize-table">'
            +'<tr><td colspan="5"><h5><span>รางวัลที่ 2 รางวัลละ 200,000 บาท</span></h5></td></tr>';
        html += '<tr>';
        for(let i=3; i<8; i++) html += '<td>'+numbers[i]+'</td>';
        html += '</tr>';
        html += '</table>';

        html += '<table class="prize-table">'
            +'<tr><td colspan="5"><h5><span>รางวัลที่ 3 รางวัลละ 80,000 บาท</span></h5></td></tr>';
        html += '<tr>';
        for(let i=8; i<13; i++) html += '<td>'+numbers[i]+'</td>';
        html += '</tr>';
        html += '<tr>';
        for(let i=13; i<18; i++) html += '<td>'+numbers[i]+'</td>';
        html += '</tr>';
        html += '</table>';

        html += '<table class="prize-table">'
            +'<tr><td colspan="5"><h5><span>รางวัลที่ 4 รางวัลละ 40,000 บาท</span></h5></td></tr>';
        for(let row=0; row<10; row++){
            html += '<tr>';
            for(let i=row*5+18; i<row*5+23; i++) html += '<td>'+numbers[i]+'</td>';
            html += '</tr>';
        }
        html += '</table>';

        html += '<table class="prize-table">'
            +'<tr><td colspan="5"><h5><span>รางวัลที่ 5 รางวัลละ 20,000 บาท</span></h5></td></tr>';
        for(let row=0; row<20; row++){
            html += '<tr>';
            for(let i=row*5+68; i<row*5+73; i++) html += '<td>'+numbers[i]+'</td>';
            html += '</tr>';
        }
        html += '</table>';

        html += '</div></div>';
        this.prize_space.html(html);


        this.generateWonPrizes(lottor);
    }

    generateWonPrizes(lottor){
        this.prizeWons = [];

        if(!lottor.lotteryCount()) this.generateWonPrizeSummary(false);
        else{
            for(let i=0; i<lottor.lotteryCount(); i++){
                let won = false, lottery = lottor.getLottery(i);

                for(let k=0; k<this.prizes.length; k++){
                    if(!won){
                        let prize = this.prizes[k];
                        if(prize.id==2){
                            if(prize.numbers.indexOf(lottery.head) > -1){
                                won = true; this.addWonPrize(lottery, prize);
                            }
                        }else if(prize.id==3){
                            if(prize.numbers.indexOf(lottery.tail) > -1){
                                won = true; this.addWonPrize(lottery, prize);
                            }
                        }else if(prize.id==4){
                            if(prize.numbers.indexOf(lottery.two) > -1){
                                won = true; this.addWonPrize(lottery, prize);
                            }
                        }else{
                            if(prize.numbers.indexOf(lottery.number) > -1){
                                won = true; this.addWonPrize(lottery, prize);
                            }
                        }
                    }
                }

                if(i == lottor.lotteryCount()-1) this.generateWonPrizeSummary(true);
            }
        }
    }
    addWonPrize(lottery, prize){
        this.prizeWons.push({
            number: lottery.number, prize_name: prize.prize_name, prize: prize.prize
        });
    }

    generateWonPrizeSummary(bought){
        let html = '';
        if(!bought){
            html += '<h2 class="primary-color">คุณไม่ได้ซื้อลอตเตอรี่ในงวดนี้</h2>'
                +'<div class="delimeter-xs"></div><hr>';
        }else if(!this.prizeWons.length){
            html += '<h2 class="primary-color">งวดนี้...คุณถูกกินเรียบ !</h2>'
                +'<div class="delimeter-xs"></div><hr>';
        }else{
            html += '<h2 class="primary-color">งวดนี้คุณดวงดี !</h2>'
                +'<div class="delimeter-xs"></div><hr>'
                +'<div class="delimeter-sm"></div>'
                +'<div class="table-wrapper"><table>';
            for(let i=0; i<this.prizeWons.length; i++){
                let prizeWon = this.prizeWons[i];
                html += '<tr>'
                    +'<td>'+prizeWon.number+'</td>'
                    +'<td>'+prizeWon.prize_name+'</td>'
                    +'<td class="text-red">'+prizeWon.prize.moneyFormat()+'</td>'
                +'</tr>';
            }
            html += '</table></div>';
        }
        $('#prize-summary-modal .summary').html(html);
    }
}
class LotteryGame {
    constructor(panel, lottor, lottoryPrize){
        this.panel = $(panel);
        this.lotteries = [];
        this.lottor = lottor;
        this.lottoryPrize = lottoryPrize;

        this.ready = false;

        $('.toggle-lottor').click(function(e){
            e.preventDefault();
            $('.lottor-container').toggleClass('active');
        });
    }

    setup(){
        this.ready = true;
        this.lotteries = [];
        this.panel.html('');

        let limit = 15;
        if(window.innerWidth < 575.98) limit = 6;
        else if(window.innerWidth < 767.98) limit = 8;
        else if(window.innerWidth < 1399.98) limit = 12;

        for(let i=0; i<limit; i++) this.add(new Lottery());
        this.updateBinding();

        $('#period').html('งวดที่ '+this.lottoryPrize.period);
    }
    resetup(){
        $('.lottery').unbind();
        $('#pick-all-lotteries').unbind();
        $('#new-lotteries').unbind();

        this.lotteries = [];
        this.panel.removeClass('fadeInRight').addClass('zoomOutLeft');

        let self = this;
        setTimeout(function(){
            self.panel.removeClass('zoomOutLeft').addClass('fadeInRight').html('');
            self.setup();
        }, 100);
    }
    resetup2(){
        $('.lottery').unbind();
        $('#pick-all-lotteries').unbind();
        $('#new-lotteries').unbind();

        this.lotteries = [];
        this.panel.removeClass('fadeInRight').addClass('zoomOutLeft');

        let self = this;
        setTimeout(function(){
            self.panel.removeClass('zoomOutLeft').addClass('fadeInRight').html('');
            self.setup();
        }, 800);
    }

    add(lottery){
        if(!lottery.on_panel){
            this.lotteries.push(lottery);
            lottery.onPanel(this.panel);
        }
        return this;
    }

    updateBinding(){
        let self = this;

        $('.lottery').unbind();
        this.panel.find('.lottery').click(function(){
            if(self.ready && !$(this).hasClass('selected')){
                self.ready = false;

                let id = $(this).attr('lottery-id'),
                    length = self.lotteries.length;
                for(let i=0; i<length; i++){
                    if(self.lotteries[i].id == id){
                        if(self.lottor.pick(self.lotteries[i])){
                            self.lotteries.splice(i, 1);
                            $(this).addClass('selected animated fadeOutDown');

                            if(!self.lotteries.length){
                                setTimeout(function(){
                                    self.resetup();
                                }, 850);
                            } else self.ready = true;

                            if(self.lottor.lotteryCount()>=50){
                                $('#new-lotteries').attr('disabled', true);
                                if(!self.lotteries.length){
                                    $('#pick-all-lotteries').attr('disabled', true);
                                    $('.lottery-panel-status').addClass('active');
                                }
                            }
                        }else{
                            $('#new-lotteries').attr('disabled', true);
                            $('#pick-all-lotteries').attr('disabled', true);
                        }
                        break;
                    }
                }
            }
        });

        $('#pick-all-lotteries').unbind();
        $('#pick-all-lotteries').click(function(e){
            e.preventDefault();
            if(self.ready){
                self.ready = false;
                let length = self.lotteries.length;

                if(self.lottor.money >= self.lotteries.length * self.lotteries[0].price){
                    for(let i=0; i<length; i++){
                        self.lottor.pick(self.lotteries[i]);
                    }
                    self.panel.find('.lottery').addClass('selected animated fadeOutDown');
                    self.lotteries = [];

                    if(self.lottor.lotteryCount()<50){
                        setTimeout(function(){
                            self.resetup();
                        }, 850);
                    }else{
                        $('#new-lotteries').attr('disabled', true);
                        $('#pick-all-lotteries').attr('disabled', true);
                        $('.lottery-panel-status').addClass('active');
                    }
                }else{
                    let i = 0;
                    while(self.lottor.pick(self.lotteries[i])){
                        self.panel.find('.lottery[lottery-id="'+self.lotteries[i].id+'"]')
                            .addClass('selected animated fadeOutDown');
                        i += 1;
                    }
                    self.lotteries = self.lotteries.slice(i, length);

                    $('#new-lotteries').attr('disabled', true);
                    $('#pick-all-lotteries').attr('disabled', true);
                }
            }
        });

        $('#new-lotteries').unbind();
        $('#new-lotteries').click(function(e){
            e.preventDefault();
            if(self.ready){
                self.ready = false;
                self.resetup2();
            }
        });

        $('#prize-announce-btn, .prize-announce-btn').unbind();
        $('#prize-announce-btn').click(function(){
            self.lottoryPrize.generate(self.lottor);
        });
        $('.prize-announce-btn').click(function(){
            self.lottoryPrize.generate(self.lottor);
            $('#broke-last-chance-modal').removeClass('fancybox-is-open').hide();
            $('#broke-last-chance-modal .fancybox-content')
                .removeClass('fadeInDown').addClass('fadeOutUp');
        });

        $('#lottery-next-period').unbind();
        $('#lottery-next-period').click(function(){
            $('#new-lotteries').attr('disabled', false);
            $('#pick-all-lotteries').attr('disabled', false);
            $('.lottery-panel-status').removeClass('active');
            $('html,body').animate({scrollTop: 0}, 350);

            self.lottoryPrize.nextPeriod(self.lottor);
            self.setup();
        })
    }
}