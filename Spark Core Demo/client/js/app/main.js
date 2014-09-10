$(document).ready(function() {
	// Get Temperature
	$.getJSON('http://192.168.0.104:8082/temperature',function(data) {
		//Temperature code here
		var collectedTemperatureData = [],
			timeTemperatureData = [];
		for (var i = 0; i < data.data.length; i++) {
			collectedTemperatureData.push(data.data[i].data.temperature);
			timeTemperatureData.push(5 * i + ' min(s)');
		}

		var lineChartData = {
			labels : timeTemperatureData,
			datasets : [
				{
					label: 'Temperature Dataset',
					fillColor : 'rgba(232, 44, 12,0.8)',
					strokeColor : 'rgba(220,220,220,1)',
					pointColor : 'rgba(220,220,220,1)',
					pointStrokeColor : '#000',
					pointHighlightFill : 'rgba(255,255,255,.9)',
					pointHighlightStroke : 'rgba(220,220,220,1)',
					data : collectedTemperatureData
				}
			]
		};
		var ctx = document.getElementById('canvas-temp-chart').getContext('2d');
		window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true,
			scaleFontColor: '#fff',
			scaleLineColor: 'rgba(255,255,255,.9)',
			scaleGridLineColor : 'rgb(255,255,255)'
		});
	});

	// Get Motions
	$.getJSON('http://192.168.0.104:8082/date/',function(data) {
		//Motion code here
		var html = '';
		var i;
		$('#times').text(data.total);
		//console.log(data);
		if (data.data.length > 5){
			for (i = data.data.length - 1; i > data.data.length - 5 ; i--) {
				html += '<li>' + data.data[i].data.datetime + '</li>';
			}
			$('#list-time ul').append(html);
		}
		if (data.data.length > 0 && data.data.length <= 5){
			for (i = 1 ; i <= data.data.length ; i++) {
				html += '<li>' + data.data[data.data.length - i].data.datetime + '</li>';
			}
			$('#list-time ul').append(html);
		}
		var period = 24; // 1 day = 24 hours
		var startTime = new Date(data.data[0].data.datetime);
		var startHour = startTime.getHours();
		var endTime = new Date(data.data[data.data.length - 1].data.datetime);
		var endHour = endTime.getHours();
		var tempDate;
		var number = 0;
		var lineChartData;
		var objDataMotionChart = {
			title : [],
			data : []
		};
		period = endHour - startHour;
		if (data.data.length > 0){
			for (i = 0; i <= period; i++) {
				number = 0;
				for (var j = 0; j < data.data.length ; j++) {
					tempDate = new Date(data.data[j].data.datetime);
					console.log(startHour + i);
					if (tempDate.getHours() === (startHour + i)){
						number++;
					}
				}
				objDataMotionChart.title.push((startHour + i).toString() + 'h - ' + (startHour + i + 1).toString() + 'h');
				objDataMotionChart.data.push(number);
			}
			lineChartData = {
				labels : objDataMotionChart.title,
				datasets : [
					{
						label: 'Motion Dataset',
						fillColor: 'rgba(255, 204, 78, 0.8)',
						strokeColor: 'rgba(255,255,255,0.8)',
						highlightFill: 'rgba(232, 44, 12,0.8)',
						highlightStroke: 'rgba(220,220,220,1)',
						data : objDataMotionChart.data
					}
				]
			};
			var cty = document.getElementById('canvas-motion-chart').getContext('2d');
			window.myLine = new Chart(cty).Bar(lineChartData, {
				responsive: false,
				scaleFontColor: '#fff',
				scaleLineColor: 'rgba(255,255,255,.9)',
				scaleGridLineColor : 'rgb(255,255,255)'
			});
		}
	});
	// Get current temperature
	$.getJSON('https://api.spark.io/v1/devices/55ff6d065075555335341887/temperature?access_token=5a4501e8e5d6ab780731274e000a5894657f9d10',function(data) {
		$('#temparature').text(data.result);
	});
});