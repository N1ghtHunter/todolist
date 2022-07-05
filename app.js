//requiring modules
const express = require("express");
const https = require("https");
const app = express();
// const date = require(__dirname + "/date.js");
const fs = require("fs");
const { log } = require("console");
const mongoose = require("mongoose");
const _ = require("lodash");
//end of requiring modules
//*
//*

app.set("view engine", "ejs");
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.static("public"));
//*

main().catch((err) => console.log(err));

async function main() {
	const uri = "mongodb+srv://admin-mazin:01033944Mazin386@cluster0.l5z4s.mongodb.net/todolistDB";
	await mongoose.connect(uri);
	const itemsSchema = {
		name: {
			type: String,
			required: true,
		},
	};
	const Item = mongoose.model("Item", itemsSchema);
	const item_1 = new Item({
		name: "Buy Food",
	});
	const item_2 = new Item({
		name: "Cook Food",
	});
	const item_3 = new Item({
		name: "Eat Food",
	});
	const defaultItems = [item_1, item_2, item_3];
	const listSchema = {
		name: String,
		items: [itemsSchema],
	};
	const List = mongoose.model("List", listSchema);
	app.get("/", function (req, res) {
		// const day = date.getDate();
		Item.find({}, (err, items) => {
			if (err) {
				console.error(err);
			} else {
				if (items.length === 0) {
					Item.insertMany(defaultItems, (err) => {
						if (!err) {
							console.log("Default Items add succesfully");
							res.redirect("/");
						} else {
							console.error(err);
						}
					});
				} else {
					items.forEach((item) => {
						console.log(item.name);
					});
					res.render("list", {
						listTitle: "Today",
						newListItem: items,
					});
				}
			}
		});
	});
	app.post("/", function (req, res) {
		const listName = req.body.list;
		const itemName = req.body.newItem;
		let newItem = new Item({
			name: itemName,
		});
		if (listName === "Today") {
			newItem.save();
			res.redirect("/");
		} else {
			List.findOne({ name: listName }, (err, foundList) => {
				foundList.items.push(newItem);
				foundList.save();
				res.redirect("/" + listName);
			});
		}

		// console.log(req.body);
		// if (req.body.list === "Work List") {
		// 	workItems.push(newItem);
		// 	res.redirect("/work");
		// } else {
		// 	items.push(newItem);
		// 	res.redirect("/");
		// }
	});
	app.post("/delete", (req, res) => {
		const checkedItemId = req.body.checkbox;
		const listName = req.body.listName;
		if (listName === "Today") {
			Item.findByIdAndRemove(checkedItemId, function (err) {
				if (!err) {
					console.log("Successfully deleted checked item");
					res.redirect("/");
				}
			});
		} else {
			List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
				if (!err) {
					res.redirect("/" + listName);
				}
			});
		}
	});
	app.get("/:customListName", (req, res) => {
		const customListName = _.capitalize(req.params.customListName);
		List.findOne(
			{
				name: customListName,
			},
			(err, foundList) => {
				if (!err) {
					if (!foundList) {
						//create a new list
						const list = new List({
							name: customListName,
							items: defaultItems,
						});
						list.save();
						res.redirect("/" + customListName);
						console.log("Not found");
					} else {
						//show an existing list
						res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
						console.log("found");
					}
				}
			}
		);
	});
	// app.get("/work", (req, res) => {
	// 	res.render("list", {
	// 		listTitle: "Work List",
	// 		newListItem: workItems,
	// 	});
	// });
	// app.get("/about", (req, res) => {
	// 	res.render("about");
	// });
	// app.post("/work", function (req, res) {
	// 	const newItem = req.body.newItem;
	// 	workItems.push(newItem);
	// 	res.redirect("/work");
	// });
}
app.listen(process.env.PORT || 3000, function () {
	console.log("server is running ON Port 3000");
});
// const workItems = [];
// const items = ["Buy Food", "Cook Food", "Eat Food"];
