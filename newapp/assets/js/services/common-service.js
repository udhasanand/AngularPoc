App.service('commonService', ['$http', '$rootScope',

    function ($http, $rootScope) {

        var response = {

            ajaxCall : function(type, url, async, data) {

                var data = $.ajax({type: type,
                    url:  url,
                    async: async
                }).responseText;
                return angular.fromJson(data);
            },
            addParameterToURL: function(url, param, value) {
            	url += (url.split('?')[1] ? '&':'?') + param + '=' + value;
            	return url;
            },
            isUndefinedOrNull : function(val) {
                return angular.isUndefined(val) || val === null || val === ""
            },
            httpCall : function(type, url, success, failure, postData) {

                var options =    {
                    method: type,
                    url:  url,
                    headers : {'Content-type':'application/x-www-form-urlencoded; charset=utf-8'},
                    data : postData
                };

                var http = $http(options).success(function(data, status, headers, config) {
                    $rootScope.loading = false;
                    if (success) {
                        success(data, status, headers, config);
                    }
                }).error(function(data, status, headers, config) {

                    /*if (status == "404") { //Need to handle once the application is stable
                    	window.location.href="/404.jsp";
                    } else if (status == "500" || status == "600") {
                    	window.location.href="/error.jsp";
                    }*/
                    $rootScope.loading = false;
                    if (status == "601") {
                    	window.location.href="/timeout.jsp?errorKey=ZERP_002";
                    } else if (failure) {
                    	failure(data, status, headers, config);
                    }
                });
            },
            serialize : function(obj) {
      		  var str = [];
      		  for (var p in obj)
      		    if (obj.hasOwnProperty(p)) {
      		      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      		    }
      		  return str.join("&");
      		},

            Map: function(name) {

                this.name = name;
                this.array = [];

                this.put = function(key, value) {
                    if (value == null) {
                        this.array.push({key: key, value: value});
                    } else {
                        var index = this.getIndex(value.key);
                        if (index > -1) {
                            this.array[index] = {key: key, value: value};
                        } else {
                            this.array.push({key: key, value: value});
                        }
                    }
                };
                this.get = function(key) {
                    var index = this.getIndex(key);
                    if (index > -1) {
                        return this.array[index].value;
                    } else {
                        return undefined;
                    }
                };
                this.getValueAtIndex = function(index) {
                    return this.array[index].value;
                };
                this.getKeyAtIndex = function(index) {
                    return this.array[index].key;
                };
                this.remove = function(value) {
                    var index = this.getIndexOfValue(value);
                    this.removeByIndex(index);
                };
                this.removeByKey = function(key) {
                    var index = this.getIndex(key);
                    this.removeByIndex(index);
                };
                this.removeByIndex = function(index) {
                    this.array.splice(index, 1);
                };
                this.clear = function() {
                    this.array = new Array(0);
                };
                this.getIndex = function(key) {
                    var index = -1;
                    for (var i = 0; i < this.array.length; i++) {
                        var item = this.array[i];
                        if (item.key == key) index = i;
                    }
                    return index;
                };
                this.getValueIndex = function(value) {
                    var index = -1;
                    for (var i = 0; i < this.array.length; i++) {
                        var item = this.array[i];
                        if (item.value == value) index = i;
                    }
                    return index;
                };
                this.contains = function(value) {
                    var index = this.getValueIndex(value);
                    return index > -1;
                };
                this.containsKey = function(key) {
                    var index = this.getIndex(key);
                    return index > -1;
                };
                this.size = function() {
                    return this.array.length;
                };
                this.quote = function(value) {
                    return '"' + value + '"';
                };
                this.encode = function(value) {
                    return value.replace(/'/g, "&#39;");
                };
                this.toJSONString = function() {
                    var mapValue = '{';
                    if (typeof this.name != 'undefined') {
                        mapValue = mapValue.concat(this.quote(this.name), ':[{');
                    }
                    var len = this.size();
                    var key;
                    var value;
                   // mapValue.concat(data)
                    for (var i = 0; i < len; i++) {
                        key = this.getKeyAtIndex(i);
                        value = this.getValueAtIndex(i);
                        if (typeof value == 'string') {
                        	value = value.replace(/"/g, '\\"');
                            mapValue = mapValue.concat(this.quote(key), ':', this.quote(value), (i == len-1) ? '' : ',');
                        } else if (typeof value == 'number' || typeof value == 'boolean') {
                            mapValue = mapValue.concat(this.quote(key), ':', value, (i == len-1) ? '' : ',');
                        } else if (value instanceof response.Map) {
                            mapValue = mapValue.concat(this.quote(key), ':', value.toJSONString(), (i == len-1) ? '' : ',');
                        } else if (value instanceof Array) {
                            mapValue = mapValue.concat(this.quote(key), ':[');
                            var arrLen = value.length;
                            for (var j = 0; j < arrLen; j++) {
                            	if (typeof value[j] == 'string') {
                            		value[j] = value[j].replace(/"/g, '\\"');
                                	mapValue = mapValue.concat(value[j], (j == arrLen-1) ? '' : ',');
                                } else {
                                	mapValue = mapValue.concat(value[j].toJSONString(), (j == arrLen-1) ? '' : ',');
                                }
                            }
                            mapValue = mapValue.concat(']', (i == len-1) ? '' : ',');
                        } else {
                            mapValue = mapValue.concat(this.quote(key), ':', null, (i == len-1) ? '' : ',');
                        }
                    }
                    if (typeof this.name == 'undefined') {
                        mapValue += '}';
                    } else {
                        mapValue += '}]}';
                    }
                    return this.encode(mapValue);
                };
                this.toJasperJSONString = function() {
                    var mapValue = '{';
                    if (typeof this.name != 'undefined') {
                        mapValue = mapValue.concat(this.quote(this.name), ':[{');
                    }
                    var len = this.size();
                    var key;
                    var value;
                    for (var i = 0; i < len; i++) {
                        key = this.getKeyAtIndex(i);
                        value = this.getValueAtIndex(i);
                        if (typeof value == 'string') {
                            value = value.replace(/"/g, '\\"');
                            mapValue = mapValue.concat(this.quote(key), ':', this.quote(value), (i == len-1) ? '' : ',');
                        } else if (typeof value == 'number' || typeof value == 'boolean') {
                            mapValue = mapValue.concat(this.quote(key), ':', value, (i == len-1) ? '' : ',');
                        } else if (value instanceof response.Map) {
                            mapValue = mapValue.concat(this.quote(key), ':', value.toJasperJSONString(), (i == len-1) ? '' : ',');
                        } else if (value instanceof Array) {
                            mapValue = mapValue.concat(this.quote(key), ':[');
                            var arrLen = value.length;
                            for (var j = 0; j < arrLen; j++) {
                            	if (typeof value[j] == 'string') {
                  	                value[j] = value[j].replace(/"/g, '\\"');
                                	mapValue = mapValue.concat(this.quote(value[j]), (j == arrLen-1) ? '' : ',');
                                } else {
                                	mapValue = mapValue.concat(value[j].toJasperJSONString(), (j == arrLen-1) ? '' : ',');
                                }
                            }
                            mapValue = mapValue.concat(']', (i == len-1) ? '' : ',');
                        } else {
                            mapValue = mapValue.concat(this.quote(key), ':', null, (i == len-1) ? '' : ',');
                        }
                    }
                    if (typeof this.name == 'undefined') {
                        mapValue += '}';
                    } else {
                        mapValue += '}]}';
                    }
                    return this.encode(mapValue);
                };
            },
            escapeLineBreak: function(value) {

                if (value != null && value != "undefined") {
                    var repStr = /\n/g;
                    value = value.replace(repStr, '\\n');
                    repStr = /\r/g;
                    value = value.replace(repStr, '\\r');
                }
                return value;
            },
            getLineBreakHtml: function(value) {

            	if (value != null && value != "undefined") {
            		value = value.replace(/& lt;/g, '<');
            		value = value.replace(/& gt;/g, '>');
            	}
            	return value;
            },
            contains: function(arrayObj, value) {
                for (var i = 0; i < arrayObj.length; i++) {
                    if (arrayObj[i] === value) {
                        return true;
                    }
                }
                return false;
            },
            validateFileExtension: function(fileName) {

            	var exp = /^.*\.(jpg|JPG|png|PNG|gif|GIF)$/;
                return exp.test(fileName);
            },
            checkIsNAN: function(value) {
            	if (response.isUndefinedOrNull(value) || isNaN(value)) {
            		return true;
            	} else {
            		return false;
            	}
            },
        }
        return response;
}]);
