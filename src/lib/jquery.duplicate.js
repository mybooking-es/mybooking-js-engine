(function ($) {
    $.fn.mybookingPluginDuplicateWindow = function () {
        var localStorageTimeout = (5) * 1000; // 15,000 milliseconds = 15 seconds.
        var localStorageResetInterval = (1/2) * 1000; // 10,000 milliseconds = 10 seconds.
        var localStorageTabKey = 'mybooking-plugin-browser-tab';
        var sessionStorageGuidKey = 'mybooking-plugin-browser-tab-guid';

        var ItemType = {
            Session: 1,
            Local: 2
        };

        function mybookingPluginSetCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
        function mybookingPluginGetCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        function mybookingPluginGetItem(itemtype) {
            var val = "";
            switch (itemtype) {
                case ItemType.Session:
                    val = window.name;
                    break;
                case ItemType.Local:
                    val = decodeURIComponent(mybookingPluginGetCookie(localStorageTabKey));
                    if (val == undefined)
                        val = "";
                    break;
            }
            return val;
        }

        function mybookingPluginSetItem(itemtype, val) {
            switch (itemtype) {
                case ItemType.Session:
                    window.name = val;
                    break;
                case ItemType.Local:
                    mybookingPluginSetCookie(localStorageTabKey, val);
                    break;
            }
        }

        function mybookingPluginCreateGUID() {
            this.s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            };
            return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
        }
      function mybookingPluginTestIfDuplicate() {
            //console.log("In mybookingTestIfDuplicate");
            var sessionGuid = mybookingPluginGetItem(ItemType.Session) || mybookingPluginCreateGUID();
            mybookingPluginSetItem(ItemType.Session, sessionGuid);

            var val = mybookingPluginGetItem(ItemType.Local);
            var tabObj = (val == "" ? null : JSON.parse(val)) || null;
            console.log(val);
            console.log(sessionGuid);
            console.log(tabObj);

            // If no or stale tab object, our session is the winner.  If the guid matches, ours is still the winner
            if (tabObj === null || (tabObj.timestamp < (new Date().getTime() - localStorageTimeout)) || tabObj.guid === sessionGuid) {
                function mybookingPluginSetTabObj() {
                    //console.log("In mybookingPluginSetTabObj");
                    var newTabObj = {
                        guid: sessionGuid,
                        timestamp: new Date().getTime()
                    };
                    mybookingPluginSetItem(ItemType.Local, JSON.stringify(newTabObj));
                }
                mybookingPluginSetTabObj();
                setInterval(mybookingPluginSetTabObj, localStorageResetInterval);//every x interval refresh timestamp in cookie
                return false;
            } else {
                // An active tab is already open that does not match our session guid.
                return true;
            }
        }

        window.mybookingPluginIsDuplicate = function () {
            var duplicate = mybookingPluginTestIfDuplicate();
            //console.log("Is Duplicate: "+ duplicate);
            return duplicate;
        };

        $(window).on("beforeunload", function () {
            if (mybookingPluginTestIfDuplicate() == false) {
                mybookingPluginSetItem(ItemType.Local, "");
                mybookingPluginSetItem(ItemType.Session, "");
            }
        });

    }
    $(window).mybookingPluginDuplicateWindow();
}(jQuery));
