var Group = require('../models/group');
var User = require('../models/users');
var UserDeck = require('../models/userdeck');
var GroupDeck = require ('../models/groupdeck');
var Announcements = require ('../models/announcements'); 
var mongoose = require('mongoose');

module.exports = {
	seedDeck : seedDeck,
	seedUserDeck: seedUserDeck,
  getGroupPage : getGroupPage,
	getUserPage : getUserPage,
    getUserDeck : getUserDeck,
	addNewGroupCard : addNewGroupCard,
	verifyCard : verifyCard,
	shareDeck : shareDeck,
	getAnnouncements : getAnnouncements 
}


function seedDeck(req, res) {
	const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/group');
  }
	console.log(req.user);
  var owner = req.user;
	var member = req.user;
	var members = [member];
	var item = new Group({id : 10, owner : owner, members: members, name : "MAT235"});
	console.log(item.members);
	console.log(item.owner);
	item.save();
	res.redirect('/group');

}

function seedUserDeck(req, res) {
	const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/user');
  }

	cuecards = []
	var item1 = new UserDeck({id : 1, name : "BIO100 test 1", user: req.user, cuecards : cuecards});
	var item2 = new UserDeck({id : 2, name : "MAT137 test 1", user: req.user, cuecards : cuecards});
	var item3 = new UserDeck({id : 3, name : "CSC369 test 1", user: req.user, cuecards : cuecards});
	var item4 = new UserDeck({id : 4, name : "CSC258 test 1", user: req.user, cuecards : cuecards});

	item1.save();
	item2.save();
	item3.save();
	item4.save();
	res.redirect('/user');
}

function getGroupPage(req, res) {
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/user');
  }

	User.find({})
	.then(function (data) {
		console.log(data);
	});
  Group.findOne({name : req.params.name})
  .then(function (data) {
    if (!data) {
      res.send("nothing in the database");
    }
    else {
			GroupDeck.find({groupid : data.id})
			.then(function(data2) {
				res.render('group', {
	        _id : data._id,
					id : data.id,
	        title : data.name,
					user: req.user.local.username,
					members: data.members,
					owner : data.owner,
					decks : data2
	      });
			});
    }
  });
}

function getUserDeck(req, res) {
    const errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors.map(err => err.msg));
        res.redirect('/user');
    }

    UserDeck.findOne({
            id: req.params.id
        })
        .then(function(data) {
            if (!data) {
                res.send('Deck not found!');
            } else {
                res.render('cue_card_front', {
                    _id: data._id,
                    id: data.id,
                    title: data.name,
                    user: req.user.local.username,
                    cuecards: data.cuecards

                });
            }
        });
}

function getUserPage(req, res) {
	const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/user');
  }

	Group.find({ members: { $elemMatch: { "local.username": req.user.local.username } } }, (err1, groups) => {
		if (err1) {
			res.status(404);
			res.send('Groups not found!');
		}

		UserDeck.find({ "user.local.username": req.user.local.username }, (err2, userdecks) => {
			if (err2) {
				res.status(404);
				res.send('UserDecks not found!');
			}

			res.render('user', {
				user: req.user.local.username,
				groups: groups,
				userdecks: userdecks,
			});
		});
	});
}

function makeId() {
	var oid = mongoose.Types.ObjectId();
	var timestamp = oid.getTimestamp();
	var str = "";
	str += timestamp.getYear();
	str+= timestamp.getMonth();
	str += timestamp.getDay();
	str += timestamp.getTime();

	var newid = parseInt(str);

	return newid;
}

function addNewGroupCard(req, res) {
	const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/user');
  }

	var newid = makeId();
	var deck = new GroupDeck({verified : req.body.verified, id : newid, groupid : req.body.groupid, name : req.body.deckname, cuecards : []});
	deck.save();

	var redirectpath = "/group/" + req.body.groupname;
	res.redirect(redirectpath);

}

function verifyCard(req, res) {
	const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    res.redirect('/user');
  }

	console.log(req.params.deckid);
	GroupDeck.update({"id": req.params.deckid}, {$set :{verified : 1}} , {upsert:true}, function(err, result) {
		if (err) {
			res.status(404);
			res.send('GroupDecks not found!');
		}
    console.log("updated");
		GroupDeck.find({})
		.then(function(data) {
			console.log(data);

			var url = "/group/" + req.body.groupname;
	    res.redirect(url);
		});
  });
}


function shareDeck(req, res) {
	UserDeck.findOne({id : req.body.deckid})
	.then(function(data){
		var usercuecards = data.cuecards;

		var groupDeck = new GroupDeck({id : makeId(), groupid : req.body.groupid, name : data.name, verified : 0, cuecards : usercuecards});
		groupDeck.save();
		res.redirect('/user');
	})
}

function getAnnouncements(req, res) { 
    const errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors.map(err => err.msg));
        res.redirect('/group');
    }

    Announcements.findOne({
            id: req.params.id
        })
        .then(function(data) {
            if (!data) {
                res.send('Announcement not found!');
            } else {
                res.render('group', {
                    groupid: data.groupid,
                    title: data.title,
	            content: data.content
                });
            }
        });

} 
