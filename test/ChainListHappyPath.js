var ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", (accounts) => {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", () => {
    return ChainList.deployed()
      .then((instance) => {
        return instance.getNumberOfArticles();
      })
      .then((data) => {
        assert.equal(data.toNumber(), 0, "number of articles must be zero");
      });
  });

  it("should let us sell a first article", () => {
    return ChainList.deployed()
      .then((instance) => {
        chainListInstance = instance;
        return chainListInstance.sellArticle(
          articleName1,
          articleDescription1,
          web3.utils.toWei(articlePrice1.toString(), "ether"),
          { from: seller }
        );
      })
      .then((receipt) => {
        assert.equal(
          receipt.logs.length,
          1,
          "one event should have been triggered"
        );
        assert.equal(
          receipt.logs[0].event,
          "LogSellArticle",
          "event should be LogSellArticle"
        );
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
        assert.equal(
          receipt.logs[0].args._seller,
          seller,
          "seller must be " + seller
        );
        assert.equal(
          receipt.logs[0].args._name,
          articleName1,
          "event article name must be " + articleName1
        );
        assert.equal(
          receipt.logs[0].args._price.toString(),
          web3.utils.toWei(String(articlePrice1), "ether"),
          "event article price must be " +
            web3.utils.toWei(String(articlePrice1), "ether")
        );

        return chainListInstance.getNumberOfArticles();
      })
      .then((data) => {
        assert.equal(data, 1, "number of articles must be one");

        return chainListInstance.getArticlesForSale();
      })
      .then((data) => {
        assert.equal(data.length, 1, "there must be one article for sale");
        assert.equal(data[0].toNumber(), 1, "article id must be 1");

        return chainListInstance.articles(data[0]);
      })
      .then((data) => {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(
          data[3],
          articleName1,
          "article name must be " + articleName1
        );
        assert.equal(
          data[4],
          articleDescription1,
          "article description must be " + articleDescription1
        );
        assert.equal(
          data[5].toString(),
          web3.utils.toWei(String(articlePrice1), "ether"),
          "article price must be " +
            web3.utils.toWei(String(articlePrice1), "ether")
        );
      });
  });

  it("should let us sell a second article", () => {
    return ChainList.deployed()
      .then((instance) => {
        chainListInstance = instance;
        return chainListInstance.sellArticle(
          articleName2,
          articleDescription2,
          web3.utils.toWei(articlePrice2.toString(), "ether"),
          { from: seller }
        );
      })
      .then((receipt) => {
        assert.equal(
          receipt.logs.length,
          1,
          "one event should have been triggered"
        );
        assert.equal(
          receipt.logs[0].event,
          "LogSellArticle",
          "event should be LogSellArticle"
        );
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
        assert.equal(
          receipt.logs[0].args._seller,
          seller,
          "seller must be " + seller
        );
        assert.equal(
          receipt.logs[0].args._name,
          articleName2,
          "event article name must be " + articleName2
        );
        assert.equal(
          receipt.logs[0].args._price.toString(),
          web3.utils.toWei(String(articlePrice2), "ether"),
          "event article price must be " +
            web3.utils.toWei(String(articlePrice2), "ether")
        );

        return chainListInstance.getNumberOfArticles();
      })
      .then((data) => {
        assert.equal(data, 2, "number of articles must be two");

        return chainListInstance.getArticlesForSale();
      })
      .then((data) => {
        assert.equal(data.length, 2, "there must be one article for sale");
        assert.equal(data[1].toNumber(), 2, "article id must be 2");

        return chainListInstance.articles(data[1]);
      })
      .then((data) => {
        assert.equal(data[0].toNumber(), 2, "article id must be 2");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(
          data[3],
          articleName2,
          "article name must be " + articleName2
        );
        assert.equal(
          data[4],
          articleDescription2,
          "article description must be " + articleDescription2
        );
        assert.equal(
          data[5].toString(),
          web3.utils.toWei(String(articlePrice2), "ether"),
          "article price must be " +
            web3.utils.toWei(String(articlePrice2), "ether")
        );
      });
  });

  it("should buy an article", () => {
    return ChainList.deployed()
      .then(async (instance) => {
        chainListInstance = instance;
        sellerBalance = await web3.eth.getBalance(seller);
        buyerBalance = await web3.eth.getBalance(buyer);

        sellerBalanceBeforeBuy = Number(
          web3.utils.fromWei(sellerBalance, "ether")
        );
        buyerBalanceBeforeBuy = Number(
          web3.utils.fromWei(buyerBalance, "ether")
        );

        return chainListInstance.buyArticle(1, {
          from: buyer,
          value: web3.utils.toWei(String(articlePrice1), "ether"),
        });
      })
      .then(async (receipt) => {
        assert.equal(
          receipt.logs.length,
          1,
          "one event should have been triggered"
        );
        assert.equal(
          receipt.logs[0].event,
          "LogBuyArticle",
          "event should be LogBuyArticle"
        );
        assert.equal(
          receipt.logs[0].args._seller,
          seller,
          "event seller must be " + seller
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "event buyer must be " + buyer
        );
        assert.equal(
          receipt.logs[0].args._name,
          articleName1,
          "event article name must be " + articleName1
        );
        assert.equal(
          receipt.logs[0].args._price.toString(),
          web3.utils.toWei(String(articlePrice1), "ether"),
          "event article price must be " +
            web3.utils.toWei(String(articlePrice1), "ether")
        );

        sellerBalanceAfterBuy = web3.utils.fromWei(
          await web3.eth.getBalance(seller),
          "ether"
        );
        buyerBalanceAfterBuy = web3.utils.fromWei(
          await web3.eth.getBalance(buyer),
          "ether"
        );

        // check the effect of buy on balances of buyer and seller, accounting for gas
        assert.equal(
          sellerBalanceAfterBuy,
          sellerBalanceBeforeBuy + articlePrice1,
          "seller should have earned " + articlePrice1 + " ETH"
        );
        assert(
          buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1,
          "buyer should have spent " + articlePrice1 + " ETH"
        );

        return chainListInstance.getArticlesForSale();
      })
      .then((data) => {
        assert.equal(
          data.length,
          1,
          "there should now be only 1 article left for sale"
        );
        assert.equal(
          data[0].toNumber(),
          2,
          "article 2 should be the only article left for sale"
        );

        return chainListInstance.getNumberOfArticles();
      })
      .then((data) => {
        assert.equal(
          data.toNumber(),
          2,
          "there should still be 2 articles in total"
        );
      });
  });
});
