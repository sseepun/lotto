var presets = window.chartColors;

window.onload = function(){
    
    $('.leaderboard-toggle').click(function(e){
        e.preventDefault();
        if(!$('#leaderboard-modal').hasClass('fancybox-is-open')){
            $('#leaderboard-modal').addClass('fancybox-is-open').show();
            $('#leaderboard-modal .fancybox-content')
                .addClass('fadeInDown').removeClass('fadeOutUp');
        }else{
            $('#leaderboard-modal').removeClass('fancybox-is-open').hide();
            $('#leaderboard-modal .fancybox-content')
                .removeClass('fadeInDown').addClass('fadeOutUp');
        }
    });
    $('#agreement-btn').click(function(){
        $('#agreement-modal').removeClass('fancybox-is-open');
        $('#agreement-modal .fancybox-content')
            .removeClass('fadeInDown').addClass('fadeOutUp');
        setTimeout(function(){
            $('#agreement-modal').remove();
        }, 750);
    });
    $('#broke-btn').click(function(e){
        e.preventDefault();
        $('#broke-modal').removeClass('fancybox-is-open');
        $('#broke-modal .fancybox-content')
            .removeClass('fadeInDown').addClass('fadeOutUp');
        setTimeout(function(){
            $('#broke-modal').hide();
        }, 750);
    });
    $('#save-game-btn').click(function(e){
        e.preventDefault();
        let total_prize = lottor.getTotalPrize();
        $('.broke-title').html('บันทึกผลลง Leaderboard');
        $('#broke-modal').addClass('fancybox-is-open').show();
        $('#broke-modal .fancybox-content').removeClass('fadeOutUp').addClass('fadeInDown');
        $('#total_prize').val(total_prize);
        $('.total_prize').html(total_prize.moneyFormat());
    });

    // Lottor's money history chart
    window.moneyChartData = {
        labels: [startPeriod],
        datasets: [{
            label: 'เงินในกระเป๋าคุณ',
            backgroundColor: presets.blue, borderColor: presets.blue, 
            fill: false, data: [startMoney]
        }]
    };
    window.moneyChart = new Chart(_('#money-chart').getContext('2d'), {
        type: 'line',
        data: window.moneyChartData,
        options: {
            title: {
                text: 'เงินในกระเป๋าคุณ', display: true, fontStyle: 'normal',
                fontFamily: "'Kanit', sans-serif", fontSize: 22, padding: 20
            },
            legend: {display: false},
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'งวด', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'บาท', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    },
                    ticks: {suggestedMin: Math.max(0, startMoney - 5000)}
                }]
            },
        }
    });

    // Lottor's lottery number history chart
    window.lotteryNumChartData = {
        labels: [],
        datasets: [{
            label: 'จำนวนลอตเตอรี่ที่ซื้อ',
            backgroundColor: presets.red, borderColor: presets.red, 
            fill: false, data: []
        }]
    };
    window.lotteryNumChart = new Chart(_('#lottery-num-chart').getContext('2d'), {
        type: 'line',
        data: window.lotteryNumChartData,
        options: {
            title: {
                text: 'จำนวนลอตเตอรี่ที่ซื้อ', display: true, fontStyle: 'normal',
                fontFamily: "'Kanit', sans-serif", fontSize: 22, padding: 20
            },
            legend: {display: false},
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'งวด', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'ลอตเตอรี่ (ใบ)', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    },
                    ticks: {suggestedMin: 0}
                }]
            },
        }
    });

    // Lottor's won history chart
    window.wonChartData = {
        labels: [],
        datasets: [{
            label: 'รางวัลจากลอตเตอรี่',
            backgroundColor: presets.green, borderColor: presets.green, 
            fill: false, data: []
        }]
    };
    window.wonChart = new Chart(_('#won-chart').getContext('2d'), {
        type: 'line',
        data: window.wonChartData,
        options: {
            title: {
                text: 'รางวัลจากลอตเตอรี่', display: true, fontStyle: 'normal',
                fontFamily: "'Kanit', sans-serif", fontSize: 22, padding: 20
            },
            legend: {display: false},
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'งวด', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true, labelString: 'รางวัล (บาท)', 
                        fontFamily: "'Kanit', sans-serif", fontSize: 15
                    },
                    ticks: {suggestedMin: 0}
                }]
            },
        }
    });

    // Lottor's ratio donut
    window.ratioDonutData = {
        datasets: [{
            data: [0, 0],
            backgroundColor: [presets.blue, presets.red]
        }],
        labels: ['เงินที่ได้', 'เงินที่เสีย']
    };
    window.ratioDonut = new Chart(_('#ratio-donut').getContext('2d'), {
        type: 'doughnut',
        data: ratioDonutData,
        options: {
            title: {
                text: 'ผลการเล่นลอตเตอรี่', display: true, fontStyle: 'normal',
                fontFamily: "'Kanit', sans-serif", fontSize: 22, padding: 20
            },
            legend: {position: 'top'},
            maintainAspectRatio: false,
            animation: {animateScale: true, animateRotate: true}
        }
    });

};