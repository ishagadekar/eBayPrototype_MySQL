CREATE DATABASE `ebaydb` /*!40100 DEFAULT CHARACTER SET utf8 */;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(45) NOT NULL,
  `lastname` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `handle` varchar(45) NOT NULL,
  `logintime` datetime DEFAULT NULL,
  `dob` date NOT NULL,
  `phone` varchar(12) NOT NULL,
  `address` varchar(45) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;



CREATE TABLE `itemsforsale` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sellerId` int(11) NOT NULL,
  `itemname` varchar(45) NOT NULL,
  `itemdescription` varchar(200) NOT NULL,
  `sellername` varchar(45) NOT NULL,
  `selleraddress` varchar(45) NOT NULL,
  `itemprice` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isbidproduct` int(11) NOT NULL,
  `bidenddate` date NOT NULL,
  `sold` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;



CREATE TABLE `shoppingcart` (
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantitybought` int(11) NOT NULL,
  KEY `itemId_idx` (`itemId`),
  CONSTRAINT `itemId` FOREIGN KEY (`itemId`) REFERENCES `itemsforsale` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ebaydb`.`userprofie` (
  `user_id` INT NOT NULL,
  `birthdate` DATE NOT NULL,
  `contactnumber` VARCHAR(45) NOT NULL,
  `location` VARCHAR(45) NOT NULL,
  INDEX `user_id_idx` (`user_id` ASC),
  CONSTRAINT `user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `ebaydb`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `useractivityhistory` (
  `orderId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantitybought` int(11) NOT NULL,
  `datepurchased` date NOT NULL,
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ebaydb`.`usersellhistory` (
  `orderId` INT NOT NULL,
  `sellerId` INT NOT NULL,
  `itemId` INT NOT NULL,
  `quantitysold` INT NOT NULL,
  `datesold` DATE NOT NULL,
  PRIMARY KEY (`orderId`));

CREATE TABLE `biduser` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `bidamount` int(11) NOT NULL,
  `biddate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `bidwinners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `highestbid` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `datewon` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;


