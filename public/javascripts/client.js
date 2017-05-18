// hootsuite

window.onload = function () {

    hsp.init({});

    // ajax

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var json = JSON.parse(this.response);
            document.getElementById("risposta").innerHTML = "";
            json.forEach(function (article) {
                // display title
                var newArticle = document.createElement('div');
                newArticle.innerHTML = article.title + '<br>';
                newArticle.className = 'article';
                // display image
                var articleImage = document.createElement('img');
                articleImage.onload = function () {
                    articleImage.width = 300;
                }
                articleImage.src = article.elements[0].url;
                newArticle.appendChild(articleImage);
                document.body.appendChild(newArticle);
            })
        }
    };
    xhttp.open("GET", "https://api.newsriver.io/v2/search?query=text%3AJuventus&sortBy=_score&sortOrder=DESC&limit=15", true);
    xhttp.setRequestHeader("Authorization", "sBBqsGXiYgF0Db5OV5tAw6mQIvkRHsRXj1ydG2cLExfkfk3fuigx_ECw83pplNwx");
    xhttp.send();
};