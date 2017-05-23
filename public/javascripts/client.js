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
            var tokenContainer = document.getElementById('token-container');
            var tokenLoginButton = document.getElementById('login-btn');
            tokenLoginButton.addEventListener('click', function () {
                var tokenTextInput = document.getElementById('token-text-input');
                var token = tokenTextInput.value.trim();

                console.log('Saving token...');
                hsp.saveData({newsriverToken: token});

                tokenContainer.classList.add('token-container-hidden');
            });

            tokenContainer.classList.remove('token-container-hidden')
        }
        // } else {
        //     loadNews(data.newsriverToken);
        // }
    });
};

function loadNews(query, token) {
    // ajax

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var articles = JSON.parse(this.response);

            var articlesContainer = document.getElementById('articles-container');
            deleteAllChildNodes(articlesContainer);

            if (articles.length > 0) {
                articles.forEach(function (article) {
                    articlesContainer.appendChild(createArticleElement(article));
                });
            } else {
                var noResults = document.createElement('div');
                noResults.className = 'no-results';

                var oops = document.createElement('h3');
                oops.innerText = 'Oops!';
                noResults.appendChild(oops);

                var text = document.createElement('p');
                text.innerText = 'We couldn\'t find any matching article';
                noResults.appendChild(text);

                articlesContainer.appendChild(noResults);
            }
        }
    };
    xhttp.open("GET", "https://api.newsriver.io/v2/search?query=" + encodeURIComponent(query), true);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.send();
}

// query is a JS object
function queryBuilder() {
    var field = document.getElementsByClassName('field');
    // console.log(field[0].value);
    // console.log(field.length);

    var phrase = document.getElementsByClassName('phrase');
    // console.log(phrase[0].value);

    var query = '';

    for (var i =0; i < field.length; i++) {
        query += field[i].value + ':' + phrase[i].value;
        if (i < field.length - 1) {
            query += ' AND '
        }
        console.log(`Field n. ${i} query = "${field[i].value}:${phrase[i].value}"`);
    }
    //
    // // var query = 'text:"Barack Obama" AND language:en AND website.domainName:(cnn.com OR USAToday.com)';
    // var query = field + ':' + phrase;
    //

    hsp.getData(function (data) {
        if (data && data.newsriverToken) {
            loadNews(query, data.newsriverToken);
        }
    });
}

function addField() {

    var fieldContainer = document.createElement('div');
    var field = document.createElement('input');
    var phrase = document.createElement('input');

    fieldContainer.className = 'field-container';
    field.className = 'field';
    phrase.className = 'phrase';

    // var defaultField = document.createTextNode('Field to be searched');
    // var defaultPhrase = document.createTextNode('Phrase to search');

    // field.appendChild(defaultField);
    // phrase.appendChild(defaultPhrase);

    field.value = 'Field to be searched';
    phrase.value = 'Phrase to search';
    fieldContainer.appendChild(field);
    fieldContainer.appendChild(phrase);

    document.getElementById('query-container').appendChild(fieldContainer);

}