// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;
import "./Ownable.sol";

contract ChainList is Ownable{
    // state variable
    struct Article {
        uint256 id;
        address seller;
        address buyer;
        string name;
        string desciption;
        uint256 price;
    }

    mapping(uint256 => Article) public articles;
    uint256 articlesCounter;

    event LogSellArticle(
        uint256 indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        uint256 indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    function kill() public onlyOwner {
        selfdestruct(payable(owner));
    }

    //sell an article
    function sellArticle(
        string memory _name,
        string memory _desciption,
        uint256 _price
    ) public {
        articlesCounter++;

        articles[articlesCounter] = Article(
            articlesCounter,
            msg.sender,
            address(0x0),
            _name,
            _desciption,
            _price
        );

        emit LogSellArticle(articlesCounter, msg.sender, _name, _price);
    }

    function buyArticle(uint256 _id) public payable {
        require(articlesCounter > 0);

        require(_id > 0 && _id <= articlesCounter);

        Article storage article = articles[_id];

        require(article.buyer == address(0x0));

        require(msg.sender != article.seller);

        require(msg.value == article.price);

        article.buyer = msg.sender;

        payable(article.seller).transfer(msg.value);

        emit LogBuyArticle(
            _id,
            article.seller,
            article.buyer,
            article.name,
            article.price
        );
    }

    function getNumberOfArticles() public view returns (uint256) {
        return articlesCounter;
    }

    function getArticlesForSale() public view returns (uint256[] memory) {
        uint256[] memory articlesIds = new uint256[](articlesCounter);

        uint256 numberOfArticlesForSale = 0;

        for (uint256 i = 1; i <= articlesCounter; i++) {
            if (articles[i].buyer == address(0x0)) {
                articlesIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        // copy to smaller array
        uint256[] memory forSale = new uint256[](numberOfArticlesForSale);
        for (uint256 i = 0; i < numberOfArticlesForSale; i++) {
            forSale[i] = articlesIds[i];
        }

        return forSale;
    }
}
