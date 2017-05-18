// hootsuite

function deleteAllChildNodes(root) {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
}

function createArticleElement(article) {
    var newArticle = document.createElement('div');
    newArticle.className = 'article';

    // find an image
    var imageUrl = null;
    article.elements.forEach(function (elem) {
        if (elem.type === 'Image') {
            imageUrl = elem.url;
        }
    });
    if (imageUrl) {
        var articleImage = document.createElement('img');
        articleImage.className = 'article-image';
        articleImage.src = imageUrl;
        newArticle.appendChild(articleImage);
    }

    var articleTitle = document.createElement('a');
    articleTitle.href = article.url;
    articleTitle.className = 'article-title';
    articleTitle.innerText = article.title;
    newArticle.appendChild(articleTitle);

    var articleText = document.createElement('div');
    articleText.className = 'article-text';
    articleText.innerText = article.text;

    newArticle.appendChild(articleText);

    var loadMoreBtn = document.createElement('div');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.innerText = 'Show more...';
    var showingMore = false;
    loadMoreBtn.addEventListener('click', function() {
        if (!showingMore) {
            articleText.classList.add('article-text-full');
            loadMoreBtn.innerText = 'Show less...';
            showingMore = true;
        } else {
            articleText.classList.remove('article-text-full');
            loadMoreBtn.innerText = 'Show more...';
            showingMore = false;
        }
    });
    newArticle.appendChild(loadMoreBtn);

    return newArticle;
}

window.onload = function () {

    hsp.init({});

    // ajax

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var articles = JSON.parse(this.response);

            var articlesContainer = document.getElementById('articles-container');
            deleteAllChildNodes(articlesContainer);

            console.log(articlesContainer);

            articles.forEach(function (article) {
                articlesContainer.appendChild(createArticleElement(article));
            });
        }
    };
    xhttp.open("GET", "https://api.newsriver.io/v2/search?query=text%3AJuventus&sortBy=_score&sortOrder=DESC&limit=15", true);
    xhttp.setRequestHeader("Authorization", "sBBqsGXiYgF0Db5OV5tAw6mQIvkRHsRXj1ydG2cLExfkfk3fuigx_ECw83pplNwx");
    xhttp.send();
};