// ===========================================================================
// This template doesn't show you all the details on how to use any exact
// UI or data API library. Instead, it just demonstrate a good way to organize
// application code, providing a usable template for quick start. Also, some
// possible glitches and quirks of used libraries are described here.
//
// For information on how to use exact UI or data API library look for
// appropriate documents from a library provider, please.
// ===========================================================================

// NOTE: It is a good behavior to isolate your code in anonymous namespace



(function ($ /*, Ext*/) { // Anonymous namespace begin, uncomment Ext argument to use SenchaTouch in your app

    var showPageId = null;

    // Application initialization using jQuery once application is loaded COMPLETELY
    $(window).bind('load', function () {

        // Use this pattern to start application with PhoneGap
        // NOTE: it looks like iPhone emulator doesn't support this PhoneGap event, so comment it out for debug.
        
        document.addEventListener("deviceready", function(){
        appStart();
        }, false);
        
        //appStart(); // Or start your application directly
    });

    function appStart() {
        initUI();
        console.log("appstart syncserver=" + RhoConnect.rho.config.syncServer);
    }

    function initUI() {

        persistence.store.rhoconnect.config(persistence);



        // Using jQuery Mobile you can force UI to switch visible page once application started
        //$.mobile.changePage($('#loginPage'));
        $("a[name=login]").bind('tap', function () {
            console.log("login clicked");
            doLogin();
        });


        $("a[name=sync_icon]").bind('tap', function () {
            //   if(!RhoConnect.isLoggedIn) {


            RhoConnect.init(modelDefinitions, 'persistencejs' /*or 'extjs' for SenchaTouch*/).done(function () {
                console.log("initialized!!!");
                reloadLists();
            });
            //    }

            /*           RhoConnect.syncAllSources().done(function () {
            console.log("Rhoconnect sync is completed");
            // Reload some lists, just for example
            reloadLists();
            }).fail(function (errCode, err) {
            // NOTE:
            // RhoConnect.syncAllSource will not fail on some exact model synchronizing error.
            // Instead, it will be reported as sync progress notification. See the reference guide.

            // Show error message on failure, just for example
            //showError('Synchronization error', errCode, err);
            errorMessage('Synchronization error ' + err);
            });
            */

        });

        $("#listPage").live('pagebeforeshow', function () {

            if (RhoConnect.isLoggedIn()) {
                $("#login_icon").hide();
            }
        });

        $('#showPage').live('pagebeforeshow', function () {
            //var url = $.url(document.location);

            //alert(url + url.param("id"));
            //    alert(sessionStorage.getItem("showPageId"));
            //    alert(showPageId);
        });

        showPageId = 1;

    }

    function doLogin() {
        var username = $('#username').val();
        var password = $('#password').val();
        if (username == "" || password == "") {
            errorMessage("Username or Password is empty");
            return;
        }
        initRhoconnect(username, password);
        //console.log("do login: username: "+ username + " password: " + password);
    }



    // Here is sample of models definition. RhoConnect.js don't need
    // a field definitions for models, but it may be needed for each
    // exact data API used in your app. So it is mandatory for now.
    // At the moment RhoConnect.js stores all values as strings.
    //    var modelDefinitions = [{
    //            name: 'Product',
    //            fields: [
    //                {name: 'id',        type: 'int'},
    //                {name: 'brand',     type: 'string'},
    //                {name: 'name',      type: 'string'}
    //            ]
    //        },{
    //            name: 'SomeOtherModel',
    //            fields: [
    //                {name: 'id',        type: 'int'},
    //                {name: 'field1',    type: 'string'},
    //                {name: 'field2',    type: 'string'}
    //            ]
    //        }];

    var modelDefinitions = [{
        name: 'FileList',
        fields: [
		     { name: 'path', type: 'string' },
             { name: 'size', type: 'string' },
             { name: 'modifieddate', type: 'string' },
             { name: 'remote_file_uri', type: 'string' },

			 ]
    }];

    function initRhoconnect(username, password) {
        // Uncomment line below if your application using Persistence.js
        //  persistence.store.rhoconnect.config(persistence);

        RhoConnect.login(username, password).done(function () {
            // Init DB for the user on success
            RhoConnect.init(modelDefinitions, 'persistencejs' /*or 'extjs' for SenchaTouch*/).done(function () {
                rhoConnectIsReadyToUse();
            }).fail(function (errCode, err) {
                // Feel free to use more UI-specific errors reporting
                //alert('RhoConnect init error: ' +errCode);
                errorMessage('Rhoconnect init error: ' + errCode);
            });
        }).fail(function (errCode, err) {
            // Feel free to use more UI-specific errors reporting
            //alert('RhoConnect login error: ' +errCode);
            errorMessage('RhoConnect login error: ' + errCode);
        });
    };

    function errorMessage(msg) {
        $('#msg').html("Error Message: " + msg);
    }

    function reloadLists() {
        var displaylist = $("#list");
        displaylist.children("li").remove();

        var model = RhoConnect.dataAccessObjects()['FileList'];

        persistence.loadFromRhoConnect(function () {
            storeLoaded();
        });

        function storeLoaded() {
            //    var data = new Array();

            model.all().each(null /*no tx*/, function (filelist) {
                //     console.log(filelist.Path + " " + filelist.Size + " " + filelist.ModifiedDate + " " + filelist.remote_file_uri);
                //  data.push(filelist);
                var id = filelist._rhoId.valueOf();
                displaylist.append($('<li></li>').wrapInner($('<a/>', {
                    href: "#",
                    text: filelist.Path.substr(1),
                    //rhoId: filelist._rhoId,
                    path: filelist.Path,
                    size: filelist.Size,
                    modifieddate: filelist.ModifiedDate,
                    remotefileuri: filelist.remote_file_uri,
                    id: "showFile"
                })));
            });

            $("a#showFile").live("tap", function () {
                $.mobile.changePage('#showPage');
                var filedetail = $('#file_detail');
                filedetail.children('li').remove();
                $('h1#filename').html($(this).attr('path').substr(1));

                var html = "<li><div class='itemLabel'>Name</div><div class='itemValue'>" + $(this).attr('path').substr(1) + "</div></li>"
                html += "<li><div class='itemLabel'>Size</div><div class='itemValue'>" + $(this).attr('size') + "</div></li>"
                html += "<li><div class='itemLabel'>Modified Date</div><div class='itemValue'>" + $(this).attr('modifieddate') + "</div></li>"
                filedetail.append(html);
                filedetail.listview('refresh');
            });

            displaylist.listview('refresh');
            //alert('My record is: ' + data.toString());

        }

    }

    function rhoConnectIsReadyToUse() {
        console.log("Rhoconnect is ready");
        $.mobile.changePage($('#listPage'));
        // Once RhoConnect.js is initialized and connected to the server, you
        // can call synchronization and use data API to access data objects
        RhoConnect.syncAllSources().done(function () {
            console.log("Rhoconnect sync is completed");
            // Reload some lists, just for example
            reloadLists();
        }).fail(function (errCode, err) {
            // NOTE:
            // RhoConnect.syncAllSource will not fail on some exact model synchronizing error.
            // Instead, it will be reported as sync progress notification. See the reference guide.

            // Show error message on failure, just for example
            //showError('Synchronization error', errCode, err);
            errorMessage('Synchronization error ' + err);
        });
    }

})(jQuery /*, Ext*/);                                   // Anonymous namespace end, uncomment Ext argument to use SenchaTouch in your app
