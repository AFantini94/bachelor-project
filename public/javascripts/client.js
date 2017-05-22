// hootsuite
function createFontAwesomeIconElement(icon) {
    var iconElement = document.createElement('i');
    iconElement.className = 'fa ' + icon;
    iconElement.setAttribute('aria-hidden', 'true');

    return iconElement;
}

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

    var buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'article-buttons-container';

    var shareBtn = document.createElement('div');
    shareBtn.className = 'share-btn';
    shareBtn.appendChild(createFontAwesomeIconElement('fa-share-square-o'));
    var shareLabel = document.createElement('span');
    shareLabel.innerText = 'Share';
    shareBtn.appendChild(shareLabel);
    shareBtn.addEventListener('click', function () {
        hsp.composeMessage(article.title + ' ' + article.url, {shortenLinks: true});
    });
    buttonsContainer.appendChild(shareBtn);

    var deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.appendChild(createFontAwesomeIconElement('fa-trash-o'));
    var deleteLabel = document.createElement('span');
    deleteLabel.innerText = 'Delete';
    deleteBtn.appendChild(deleteLabel);
    deleteBtn.addEventListener('click', function () {
        newArticle.parentNode.removeChild(newArticle);
    });
    buttonsContainer.appendChild(deleteBtn);

    newArticle.appendChild(buttonsContainer);

    return newArticle;
}

window.onload = function () {

    hsp.init({});


    hsp.getData(function (data) {
        console.log(data);
        if (!data || !data.newsriverToken) {
            console.log('saving token...');
            hsp.saveData({newsriverToken: 'sBBqsGXiYgF0Db5OV5tAw6mQIvkRHsRXj1ydG2cLExfkfk3fuigx_ECw83pplNwx'});
        } else {
            loadNews(data.newsriverToken);
        }
    });
};

function loadNews(token) {
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
    xhttp.setRequestHeader("Authorization", token);
    xhttp.send();
}