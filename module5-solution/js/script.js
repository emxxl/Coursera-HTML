(function (global) {
  var dc = {};

  // Remote (original course) endpoints
  var REMOTE = {
    categories: "https://davids-restaurant.herokuapp.com/categories.json",
    menuItems:  "https://davids-restaurant.herokuapp.com/menu_items.json?category="
  };

  // Local fallback data (self-hosted in this repo)
  var LOCAL = {
    categories: "data/categories.json",
    menuItems:  "data/menu_items/" // + SHORT.json
  };

  var homeHtml = "snippets/home-snippet.html";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  var showLoading = function (selector) {
    var html = "<div class='text-center'><img src='images/ajax-loader.gif' alt='Loading'></div>";
    insertHtml(selector, html);
  };

  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    return string.replace(new RegExp(propToReplace, "g"), propValue);
  };

  // --- Boot: load home with random category (remote first, fallback local) ---
  document.addEventListener("DOMContentLoaded", function () {
    showLoading("#main-content");
    var rendered = false;

    function build(categories) {
      $ajaxUtils.sendGetRequest(homeHtml, function (homeHtmlResponse) {
        var random = categories[Math.floor(Math.random() * categories.length)];
        var shortName = random.short_name;
        var homeHtmlToInsert = insertProperty(homeHtmlResponse, "randomCategoryShortName", "'" + shortName + "'");
        insertHtml("#main-content", homeHtmlToInsert);
        rendered = true;
      }, false);
    }

    // Try remote first
    $ajaxUtils.sendGetRequest(REMOTE.categories, function (cats) { build(cats); }, true);

    // If remote fails (no render within 1500ms), fall back to local static data
    setTimeout(function () {
      if (!rendered) {
        $ajaxUtils.sendGetRequest(LOCAL.categories, function (cats) { build(cats); }, true);
      }
    }, 1500);
  });

  // --- Categories view ---
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    var done = false;
    function render(cats) {
      $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (titleHtml) {
        $ajaxUtils.sendGetRequest(categoryHtml, function (catHtml) {
          var finalHtml = titleHtml + "<section class='row'>";
          for (var i = 0; i < cats.length; i++) {
            var html = catHtml;
            html = insertProperty(html, "name", cats[i].name);
            html = insertProperty(html, "short_name", cats[i].short_name);
            finalHtml += html;
          }
          finalHtml += "</section>";
          insertHtml("#main-content", finalHtml);
          done = true;
        }, false);
      }, false);
    }
    $ajaxUtils.sendGetRequest(REMOTE.categories, function (cats) { render(cats); }, true);
    setTimeout(function(){ if (!done) { $ajaxUtils.sendGetRequest(LOCAL.categories, function (cats) { render(cats); }, true); } }, 1500);
  };

  // --- Single category (menu items) ---
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    var done = false;
    function render(data) {
      $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (titleHtml) {
        $ajaxUtils.sendGetRequest(menuItemHtml, function (itemHtml) {
          var title = insertProperty(titleHtml, "name", data.category.name);
          title = insertProperty(title, "special_instructions", data.category.special_instructions || "");
          var finalHtml = title + "<section class='row'>";
          for (var i = 0; i < data.menu_items.length; i++) {
            var html = itemHtml;
            html = insertProperty(html, "short_name", data.menu_items[i].short_name);
            html = insertProperty(html, "catShortName", data.category.short_name);
            html = insertProperty(html, "name", data.menu_items[i].name);
            html = insertProperty(html, "description", data.menu_items[i].description || "");
            html = insertProperty(html, "price_small", data.menu_items[i].price_small ? ("$" + data.menu_items[i].price_small.toFixed(2)) : "");
            html = insertProperty(html, "small_portion_name", data.menu_items[i].small_portion_name ? ("(" + data.menu_items[i].small_portion_name + ")") : "");
            html = insertProperty(html, "price_large", data.menu_items[i].price_large ? ("$" + data.menu_items[i].price_large.toFixed(2)) : "");
            html = insertProperty(html, "large_portion_name", data.menu_items[i].large_portion_name ? ("(" + data.menu_items[i].large_portion_name + ")") : "");
            finalHtml += html;
          }
          finalHtml += "</section>";
          insertHtml("#main-content", finalHtml);
          done = true;
        }, false);
      }, false);
    }

    // remote
    $ajaxUtils.sendGetRequest(REMOTE.menuItems + categoryShort, function (data) { render(data); });
    // local fallback
    setTimeout(function(){
      if (!done) {
        $ajaxUtils.sendGetRequest(LOCAL.menuItems + categoryShort + ".json", function (data) { render(data); }, true);
      }
    }, 1500);
  };

  global.$dc = dc;
})(window);