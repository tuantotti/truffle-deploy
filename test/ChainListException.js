var ChainList = artifacts.require("ChainList.sol");

contract("ChainList", (accounts) => {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;

  it("should throw an exception if you try to buy an article that does not exist", () => {
    return ChainList.deployed()
      .then((instance) => {
        chainListInstance = instance;
        return chainListInstance.sellArticle(
          articleName,
          articleDescription,
          web3.utils.toWei(articlePrice.toString(), "ether"),
          { from: seller }
        );
      })
      .then(() => {
        return chainListInstance.buyArticle(2, {
          from: seller,
          value: wweb3.utils.toWei(articlePrice.toString(), "ether"),
        });
      })
      .then(assert.fail)
      .catch(() => {
        assert(true);
      })
      .then(() => {
        return chainListInstance.articles(1);
      })
      .then((data) => {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(
          data[3],
          articleName,
          "article name must be " + articleName
        );
        assert.equal(
          data[4],
          articleDescription,
          "article description must be " + articleDescription
        );
        assert.equal(
          data[5].toString(),
          web3.utils.toWei(String(articlePrice), "ether"),
          "article price must be " +
            web3.utils.toWei(String(articlePrice), "ether")
        );
      });
  });
});
