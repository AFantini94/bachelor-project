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


var expandedArticle = null;
function createArticleElement(article) {
    console.log(article);
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
    articleTitle.target = '_blank';
    articleTitle.rel = 'noopener noreferrer';
    articleTitle.className = 'article-title';
    articleTitle.innerText = article.title;
    newArticle.appendChild(articleTitle);

    var articlePublishDate = document.createElement('p');
    articlePublishDate.className = 'article-date';
    if (article.publishDate) {
        var publishDate = new Date(article.publishDate);
        articlePublishDate.innerText = 'Published by ' + article.website.name +
            ' on ' + publishDate.toLocaleDateString();

        // some articles have wrong publish time
        if (publishDate.getHours() !== 0 || publishDate.getMinutes() !== 0 || publishDate.getSeconds() !== 0) {
            articlePublishDate.innerText += ' at ' + publishDate.toLocaleTimeString();
        }
    } else {
        articlePublishDate.innerText = 'Published by ' + article.website.name;
    }
    newArticle.appendChild(articlePublishDate);

    var articleText = document.createElement('div');
    articleText.className = 'article-text';
    articleText.innerText = article.text;

    var loadMoreBtn = document.createElement('div');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.innerText = 'Show more...';
    var showingMore = false;
    loadMoreBtn.addEventListener('click', function() {
        showingMore = !showingMore;
        if (showingMore) {
            if (expandedArticle !== null) {
                expandedArticle.classList.remove('expanded');
                expandedArticle.classList.remove('article-text-full');
            }

            newArticle.classList.add('expanded');
            articleText.classList.add('article-text-full');
            loadMoreBtn.innerText = 'Show less...';

            expandedArticle = newArticle;
        } else {
            newArticle.classList.remove('expanded');
            articleText.classList.remove('article-text-full');
            loadMoreBtn.innerText = 'Show more...';

            expandedArticle = null;
        }

        newArticle.scrollIntoView();
    });

    var articleTextContainer = document.createElement('div');
    articleTextContainer.appendChild(articleText);
    articleTextContainer.appendChild(loadMoreBtn);
    articleTextContainer.className = 'article-text-container';

    newArticle.appendChild(articleTextContainer);

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


    var loginContainer = document.getElementById('login-container');
    var mainContentContainer = document.getElementById('main-content-container');
    var tokenLoginButton = document.getElementById('login-btn');
    tokenLoginButton.addEventListener('click', function () {
        var tokenTextInput = document.getElementById('token-text-input');
        var token = tokenTextInput.value.trim();
        if (token.length > 0) {
            tokenTextInput.value = '';

            console.log('Saving token...');
            hsp.saveData({newsriverToken: token});

            loginContainer.classList.add('logged-in');
            mainContentContainer.classList.remove('hidden');
        }
    });

    var queryBuilderContainer = document.getElementById('query-builder-container');
    var queryStringContainer = document.getElementById('query-string-container');
    var showAdvancedQuery = document.getElementById('show-advanced-query');
    var showSimpleQuery = document.getElementById('show-simple-query');
    window.advancedQuery = false;
    var toggleQuery = function () {
        if (window.advancedQuery) {
            queryBuilderContainer.classList.remove('hidden');
            queryStringContainer.classList.add('hidden');
        } else {
            queryBuilder();
            queryBuilderContainer.classList.add('hidden');
            queryStringContainer.classList.remove('hidden');
        }
        window.advancedQuery = !window.advancedQuery;
    };
    showAdvancedQuery.addEventListener('click', toggleQuery);
    showSimpleQuery.addEventListener('click', toggleQuery);


    var logoutBtn = document.getElementById('logoutButton');
    logoutBtn.addEventListener('click', logout);

    hsp.getData(function (data) {
        console.log(data);
        if (data && data.newsriverToken) {
            loginContainer.classList.add('logged-in');
            mainContentContainer.classList.remove('hidden');
        }
    });

    addField();

    // document.getElementsByClassName('field')[0].addEventListener('change', detectInput);
    // console.log(document.getElementsByClassName('field')[0])
};

function logout() {
    hsp.saveData(null);

    var loginContainer = document.getElementById('login-container');
    var mainContentContainer = document.getElementById('main-content-container');
    loginContainer.classList.remove('logged-in');
    mainContentContainer.classList.add('hidden');
}

function searchNews() {
    var query = queryBuilder();

    hsp.getData(function (data) {
        if (data && data.newsriverToken) {
            loadNews(query, data.newsriverToken);
        }
    });
}

function loadNews(query, token) {
    var loadingStatus = document.getElementById('loading-status-container');
    loadingStatus.classList.remove('hidden');

    // result sorting
    var sortSelect = document.getElementById('sort');
    var sort = '';
    switch (sortSelect.value) {
        case 'score':
            sort = '_score';
            break;
        case 'date':
            sort = 'discoverDate';
            break;
        case 'read':
            sort = 'metadata.readTime.seconds';
            break;
    }

    var sortOrderSelect = document.getElementById('sortOrder');
    var sortOrder = sortOrderSelect.value;

    // ajax

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            loadingStatus.classList.add('hidden');
        }

        if (this.readyState === 4 && this.status === 200) {
            var articles = JSON.parse(this.response);

            var articlesContainer = document.getElementById('articles-container');
            deleteAllChildNodes(articlesContainer);

            if (articles.length > 0) {
                articles.forEach(function (article) {
                    articlesContainer.appendChild(createArticleElement(article));
                });
                articles[0].scrollIntoView();
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
    xhttp.open("GET", "https://api.newsriver.io/v2/search?query=" + encodeURIComponent(query) +
        '&sortBy=' + sort +
        '&sortOrder=' + sortOrder, true);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.send();
}

// query is a JS object
function queryBuilder() {
    var customQueryString = document.getElementById('custom-query-string');

    var query = '';
    // if the user provided a custom Lucene query, use it
    if (window.advancedQuery) {
        query = customQueryString.value.trim();
    } else {
        var fields = document.getElementsByClassName('field');
        // console.log(field[0].value);
        // console.log(field.length);

        var phrase = document.getElementsByClassName('phrase');
        // console.log(phrase[0].value);

        var andOrGroups = document.getElementsByClassName('and-or-container');
        var notContainers = document.getElementsByClassName('not-container');

        for (var i = 0; i < fields.length; i++) {
            query += fields[i].value + ':' + phrase[i].value;
            if (i < fields.length - 1) {
                if (andOrGroups[i].booleanOp) {
                    query += ' AND ';
                } else {
                    query += ' OR ';
                }

                if (notContainers[i].checked) {
                    query += 'NOT ';
                }
            }
            console.log(`Field n. ${i} query = "${fields[i].value}:${phrase[i].value}"`);
        }

        customQueryString.value = query;
    }
    //
    // // var query = 'text:"Barack Obama" AND language:en AND website.domainName:(cnn.com OR USAToday.com)';
    // var query = field + ':' + phrase;
    //

    console.log('Query', query);

    return query;
}

function removeAndOrNotButtonsFromFirstFieldContainer() {
    var fieldContainers = document.getElementsByClassName('field-container');
    if (fieldContainers.length > 0) {
        var container = fieldContainers[0];

        var andOrGroups = container.getElementsByClassName('and-or-container');
        if (andOrGroups.length > 0) {
            andOrGroups[0].parentNode.removeChild(andOrGroups[0]);
        }

        var notContainer = container.getElementsByClassName('not-container');
        if (notContainer.length > 0) {
            notContainer[0].parentNode.removeChild(notContainer[0]);
        }
    }
}

function addField() {
    var queryContainer = document.getElementById('query-container');
    var fieldContainer = document.createElement('div');
    var styledSelectDiv = document.createElement('div');
    var field = document.createElement('select');
    var minusButton = document.createElement('button');
    minusButton.type = 'button';
    minusButton.className = 'btn delete-field-btn';
    minusButton.appendChild(createFontAwesomeIconElement('fa-fw fa-trash'));
    minusButton.addEventListener('click', function () {
        fieldContainer.parentNode.removeChild(fieldContainer);
        removeAndOrNotButtonsFromFirstFieldContainer();
    });

    fieldContainer.className = 'field-container';
    styledSelectDiv.className = 'styled-select';
    field.className = 'field';
    var phrase = document.createElement('input');
    phrase.className = 'phrase';

    phrase.placeholder = 'Phrase to search';

    if (queryContainer.querySelector('.field-container') !== null) {
        // and/or button group
        var andOrContainer = document.createElement('div');
        andOrContainer.className = 'and-or-container';
        var andButton = document.createElement('div');
        andButton.innerText = 'AND';
        andButton.className = 'and-or-btn no-select';
        andButton.classList.add('highlight');
        var orButton = document.createElement('div');
        orButton.innerText = 'OR';
        orButton.className = 'and-or-btn no-select';
        andOrContainer.appendChild(andButton);
        andOrContainer.appendChild(orButton);
        andOrContainer.booleanOp = true; // true = AND, false = OR
        andOrContainer.addEventListener('click', function () {
            andOrContainer.booleanOp = !andOrContainer.booleanOp;
            andButton.classList.toggle('highlight');
            orButton.classList.toggle('highlight');
        });

        fieldContainer.appendChild(andOrContainer);

        var notContainer = document.createElement('div');
        notContainer.className = 'not-container';
        notContainer.checked = false;
        notContainer.addEventListener('click', function () {
            notContainer.checked = !notContainer.checked;
            notContainer.classList.toggle('highlight');
        });

        var notButton = document.createElement('div');
        notButton.className = 'not-btn no-select';
        notButton.innerText = 'NOT';

        notContainer.appendChild(notButton);

        fieldContainer.appendChild(notContainer);
    }

    // add language selection
    field.addEventListener('input', function () {
        fieldContainer.removeChild(phrase);
        if (field.value === 'language') {
            var newPhrase = getLanguageSelect();
        } else {
            newPhrase = document.createElement('input');
            newPhrase.className = 'phrase';

            newPhrase.placeholder = 'Phrase to search';
        }

        phrase = newPhrase;

        fieldContainer.insertBefore(newPhrase, minusButton);
    });

    styledSelectDiv.appendChild(appendFields(field));
    fieldContainer.appendChild(styledSelectDiv);
    fieldContainer.appendChild(phrase);
    fieldContainer.appendChild(minusButton);

    queryContainer.appendChild(fieldContainer);
}

function getLanguageSelect() {
    var styledSelectDiv = document.createElement('div');
    styledSelectDiv.className = 'styled-select';

    var select = document.createElement('select');
    select.className = 'phrase';

    var languagePairs = [
        ["null", "-- Most Used --"],
        ["EN", "English"],
        ["ES", "Spanish"],
        ["DE", "German"],
        ["FR", "French"],
        ["IT", "Italian"],
        ["RU", "Russian"],
        ["PT", "Portuguese"],
        ["null", "-- All --"],
        ["SQ", "Albanian"],
        ["AR", "Arabic"],
        ["HY", "Armenian"],
        ["EU", "Basque"],
        ["BN", "Bengali"],
        ["BG", "Bulgarian"],
        ["CA", "Catalan"],
        ["KM", "Cambodian"],
        ["ZH", "Chinese (Mandarin)"],
        ["HR", "Croation"],
        ["CS", "Czech"],
        ["DA", "Danish"],
        ["NL", "Dutch"],
        ["EN", "English"],
        ["ET", "Estonian"],
        ["FJ", "Fiji"],
        ["FI", "Finnish"],
        ["FR", "French"],
        ["KA", "Georgian"],
        ["DE", "German"],
        ["EL", "Greek"],
        ["GU", "Gujarati"],
        ["HE", "Hebrew"],
        ["HI", "Hindi"],
        ["HU", "Hungarian"],
        ["IS", "Icelandic"],
        ["ID", "Indonesian"],
        ["GA", "Irish"],
        ["IT", "Italian"],
        ["JA", "Japanese"],
        ["JW", "Javanese"],
        ["KO", "Korean"],
        ["LA", "Latin"],
        ["LV", "Latvian"],
        ["LT", "Lithuanian"],
        ["MK", "Macedonian"],
        ["MS", "Malay"],
        ["ML", "Malayalam"],
        ["MT", "Maltese"],
        ["MI", "Maori"],
        ["MR", "Marathi"],
        ["MN", "Mongolian"],
        ["NE", "Nepali"],
        ["NO", "Norwegian"],
        ["FA", "Persian"],
        ["PL", "Polish"],
        ["PT", "Portuguese"],
        ["PA", "Punjabi"],
        ["QU", "Quechua"],
        ["RO", "Romanian"],
        ["RU", "Russian"],
        ["SM", "Samoan"],
        ["SR", "Serbian"],
        ["SK", "Slovak"],
        ["SL", "Slovenian"],
        ["ES", "Spanish"],
        ["SW", "Swahili"],
        ["SV", "Swedish "],
        ["TA", "Tamil"],
        ["TT", "Tatar"],
        ["TE", "Telugu"],
        ["TH", "Thai"],
        ["BO", "Tibetan"],
        ["TO", "Tonga"],
        ["TR", "Turkish"],
        ["UK", "Ukranian"],
        ["UR", "Urdu"],
        ["UZ", "Uzbek"],
        ["VI", "Vietnamese"],
        ["CY", "Welsh"],
        ["XH", "Xhosa"]
    ];

    languagePairs.forEach(function (pair) {
        var option = document.createElement('option');
        option.value = pair[0];
        option.text = pair[1];

        if (option.value === 'null') {
            option.disabled = true;
        }

        select.appendChild(option);
    });

    styledSelectDiv.appendChild(select);

    return styledSelectDiv;
}

function appendFields(selectElement) {

    var articleField = document.createElement('option');
    articleField.text = 'Article Field';
    articleField.value = 'null';
    articleField.disabled = true;
    articleField.selected = true;

    var titleField = document.createElement('option');
    titleField.text = 'Title (only)';
    titleField.value = 'title';

    var textField = document.createElement('option');
    textField.text = 'Text';
    textField.value = 'text';

    var languageField = document.createElement('option');
    languageField.text = 'Language';
    languageField.value = 'language';


    selectElement.appendChild(articleField);
    selectElement.appendChild(titleField);
    selectElement.appendChild(textField);
    selectElement.appendChild(languageField);

    return selectElement;
}
