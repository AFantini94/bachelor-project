// hootsuite

window.onload = function () {

    hsp.init({});

    // ajax

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("risposta").innerHTML =
                this.responseText;
        }
    };
    xhttp.setRequestHeader("Authorization", "sBBqsGXiYgF0Db5OV5tAw6mQIvkRHsRXj1ydG2cLExfkfk3fuigx_ECw83pplNwx");
    xhttp.open("GET", "https://api.newsriver.io/v2/search?query=text%3AJuventus&sortBy=_score&sortOrder=DESC&limit=15", true);
    xhttp.send();
};