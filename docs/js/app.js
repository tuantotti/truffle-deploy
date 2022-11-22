App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init() {
    return App.initWeb3();
  },

  async initWeb3() {
    if (typeof web3 !== undefined) {
      // reuse the provider of the web3 object injected by Metamask
      App.web3Provider = window.ethereum;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();

    return App.initContract();
  },

  async displayAccountInfo() {
    web3.eth
      .getCoinbase((err, account) => {
        if (err === null) {
          App.account = account;
          $("#account").text(account);
          return account;
        }
      })
      .then((account) => {
        web3.eth
          .getBalance(account, (err, balance) => {
            if (err === null) {
              $("#accountBalance").text(
                web3.utils.fromWei(balance, "ether") + " ETH"
              );
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  },

  async initContract() {
    $.getJSON("ChainList.json", (chainListArtifact) => {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // listen to event
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  async reloadArticles() {
    if (App.loading) {
      return;
    }

    App.loading = true;

    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ChainList.deployed()
      .then((instance) => {
        chainListInstance = instance;
        console.log(chainListInstance);
        return chainListInstance.getArticlesForSale();
      })
      .then((articleIds) => {
        console.log(articleIds);
        $("#articlesRow").empty();

        for (var i = 0; i < articleIds.length; i++) {
          var articleId = articleIds[i];
          chainListInstance
            .articles(articleId.toNumber())
            .then(function (article) {
              App.displayArticle(
                article[0],
                article[1],
                article[3],
                article[4],
                article[5]
              );
            });
        }
        App.loading = false;
      })
      .catch((err) => {
        console.log(err.message);
        App.loading = false;
      });
  },

  async displayArticle(id, seller, name, description, price) {
    var articlesRow = $("#articlesRow");

    var etherPrice = web3.utils.fromWei(price.toString(), "ether");

    var articleTemplate = $("#articleTemplate");
    articleTemplate.find(".panel-title").text(name);
    articleTemplate.find(".article-description").text(description);
    articleTemplate.find(".article-price").text(etherPrice + " ETH");
    articleTemplate.find(".btn-buy").attr("data-id", id);
    articleTemplate.find(".btn-buy").attr("data-value", etherPrice);

    // seller
    if (seller.toLowerCase() == App.account) {
      articleTemplate.find(".article-seller").text("You");
      articleTemplate.find(".btn-buy").hide();
    } else {
      articleTemplate.find(".article-seller").text(seller);
      articleTemplate.find(".btn-buy").show();
    }

    // add this new article
    articlesRow.append(articleTemplate.html());
  },

  async sellArticle() {
    var _article_name = $("#article_name").val();
    var _description = $("#article_description").val();
    var _price = web3.utils.toWei(
      String(parseFloat($("#article_price").val() || 0)),
      "ether"
    );

    console.log(typeof _price);

    if (_article_name.trim() == "" || _price == 0) {
      return false;
    }

    App.contracts.ChainList.deployed()
      .then((instance) => {
        return instance.sellArticle(_article_name, _description, _price, {
          from: App.account,
          gas: 500000,
        });
      })
      .catch((err) => console.log(err));
  },

  // listen events triggerd by the contract
  async listenToEvents() {
    App.contracts.ChainList.deployed().then((instance) => {
      instance.contract.events.LogSellArticle({}, (error, evt) => {
        if (!error) {
          console.log($("#events"));
          $("#events").append(
            '<li class="list-group-item">' +
              evt.returnValues._name +
              " is now for sale</li>"
          );
        } else {
          console.log(error);
        }
        App.reloadArticles();
      });

      instance.contract.events.LogBuyArticle({}, (error, evt) => {
        console.log(evt);
        if (!error) {
          console.log($("#events"));

          $("#events").append(
            '<li class="list-group-item">' +
              evt.returnValues._buyer +
              " bought " +
              evt.returnValues._name +
              "</li>"
          );
        } else {
          console.log(error);
        }
        App.reloadArticles();
      });
    });
  },

  async buyArticle() {
    event.preventDefault();

    var _articleId = $(event.target).data("id");
    var _price = parseFloat($(event.target).data("value"));

    App.contracts.ChainList.deployed()
      .then((instance) => {
        return instance.buyArticle(_articleId, {
          from: App.account,
          value: web3.utils.toWei(String(_price), "ether"),
          gas: 500000,
        });
      })
      .catch((err) => console.log(err));
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
