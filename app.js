const apiUrl = 'https://api.thingspeak.com/channels/1596152/feeds.json?results=10';
let charts = {};

// Fetch and update data
function fetchData() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.feeds || data.feeds.length === 0) {
                console.error('No data available from API');
                return;
            }

            const feeds = data.feeds;

            // Extract values for each field
            const pm25 = feeds.map(feed => parseFloat(feed.field1) || 0);
            const pm10 = feeds.map(feed => parseFloat(feed.field2) || 0);
            const ozone = feeds.map(feed => parseFloat(feed.field3) || 0);
            const humidity = feeds.map(feed => parseFloat(feed.field4) || 0);
            const temperature = feeds.map(feed => parseFloat(feed.field5) || 0);
            const co = feeds.map(feed => parseFloat(feed.field6) || 0);

            // Extract time labels
            const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());

            // Update charts
            updateChart('pm25Chart', 'PM2.5', labels, pm25, '#FF5733');
            updateChart('pm10Chart', 'PM10', labels, pm10, '#33FF57');
            updateChart('ozoneChart', 'Ozone', labels, ozone, '#5733FF');
            updateChart('humidityChart', 'Humidity', labels, humidity, '#F4D03F');
            updateChart('temperatureChart', 'Temperature', labels, temperature, '#8E44AD');
            updateChart('coChart', 'CO', labels, co, '#1F618D');

            // Update the last refresh time
            const lastRefreshTime = new Date(feeds[feeds.length - 1].created_at);
            document.getElementById('lastRefreshTime').textContent = lastRefreshTime.toLocaleString();
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Create or update a chart
function updateChart(chartId, label, labels, data, borderColor) {
    const ctx = document.getElementById(chartId).getContext('2d');

    if (charts[chartId]) {
        // Update the existing chart
        charts[chartId].data.labels = labels;
        charts[chartId].data.datasets[0].data = data;
        charts[chartId].update();
    } else {
        // Create a new chart
        charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: `${borderColor}33`, // Light transparent background
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: label
                        }
                    }
                }
            }
        });
    }
}

// Fetch data initially
fetchData();

// Set interval to refresh data every minute
setInterval(fetchData, 60000);
