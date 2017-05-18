App.controller('PageContentTreeCtrl', ['$scope', '$localStorage', '$window', '$http', '$state', 'Notification', 'commonService',
    function ($scope, $localStorage, $window, $http, $state, Notification, commonService) {

        $scope.userDetails = $localStorage.userDetails;
        if ($scope.userDetails == undefined
                || $scope.userDetails == null
                || $.isEmptyObject($scope.userDetails)) {
            Notification.error('Session has expired, Please login again!');
            $state.go('login');
        }
        var treeDataBaseSet = [];
        // Preview page loader
        $scope.previewPageLoader2 = function () {
            $scope.helpers.uiBlocks('#tree-block', 'state_loading');

            setTimeout(function () {
                $scope.helpers.uiBlocks('#tree-block', 'state_normal');
                swal('Success', 'Action executed successfully!', 'success');
            }, 3000);
        };

        // Preview page loader
        $scope.deleteAlert1 = function () {
            swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this XML!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d26a5c',
                    confirmButtonText: 'Yes, delete it!',
                    html: false,
                    preConfirm: function() {
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve();
                            }, 50);
                        });
                    }
                }).then(
                    function (result) {
                        swal('Deleted!', 'Your XML has been deleted.', 'success');
                    }, function(dismiss) {
                        // dismiss can be 'cancel', 'overlay', 'esc' or 'timer'
                    }
                );
        };

        $scope.isMeta = true;
        $scope.isWip = false;
        $scope.isStableMenu = true;
        $scope.isWipMenu = true;
        $scope.metaDataList = [];
        $scope.treeData = [];
        $scope.stableRightClickMenuList = [];
        $scope.wipRightClickMenuList = [];
        $scope.userDetails = $localStorage.userDetails; 
        // Bootstrap Tree View, for more examples you can check out https://github.com/jonmiles/bootstrap-treeview
        // Init Badges Tree
        var invokeTree = function () {

            jQuery('.js-tree-badges').treeview({
                data: $scope.treeData,
                color: '#555',
                expandIcon: 'fa fa-plus',
                collapseIcon: 'fa fa-minus',
                nodeIcon: 'fa fa-folder text-primary',
                onhoverColor: '#f9f9f9',
                selectedColor: '#555',
                selectedBackColor: '#f1f1f1',
                showTags: true,
                multiSelect: false,
                levels: 10,
                onNodeSelected: function(event, data) {

                    $scope.selectedNode = {};
                    $scope.selectedNode = data;
                    $scope.isStableMenu = true;
                    $scope.isWipMenu = true;
                    if (data.type == 'StableData' || data.type == 'WIP') {

                        if (data.type == 'StableData') {
                            $scope.isStableMenu = false;
                        } else {
                            $scope.isWipMenu = false;
                        }
                        $scope.getRightClickMenuAtStableAndWIPLevel(data);
                    } else if (data.type == 'WIPSubfolder') {

                        $scope.isStableMenu = true;
                        $scope.isWipMenu = false;
                        $scope.getRightClickMenuAtWipIssueLevel(data);
                    } else if (data.type == 'StableSubfolder') {

                        $scope.isStableMenu = false;
                        $scope.isWipMenu = true;
                        $scope.getRightClickMenuAtGuidecardevel(data);
                    } else if (data.type == 'comchop') {

                        $scope.setMetaData(data);
                        if (data.parentNodeDetails.indexOf('StableData') >= 0) {

                            $scope.isStableMenu = false;
                            $scope.isWipMenu = true;
                        } else {

                             $scope.isStableMenu = true;
                            $scope.isWipMenu = false;
                        }
                        $scope.getRightClickMenuAtWipCommchapLevel(data);
                    } else if (data.type == 'WIPSubFolderGuidecard') {

                        $scope.isStableMenu = true;
                        $scope.isWipMenu = false;
                        $scope.getRightClickMenuAtGuidecardevel(data);
                    }
                },
                onNodeExpanded: function(event, data) {

                    if (data.type == 'country') {
                        $scope.getContentType(data.text);
                    } else if (data.type == 'contentType') {
                        $scope.getPublication(data.text, data.parentNodeDetails);
                    } else if (data.type == 'publication') {
                        $scope.getStableAndWip(data.text, data.parentNodeDetails);
                    } else if (data.type == 'StableData' || data.type == 'WIP') {

                        if (data.nodes.length < 1) {
                            $scope.getStableAndWipContent(data.text, data.parentNodeDetails);
                        }
                    } else if (data.type == 'WIPSubfolder') {

                        if (data.nodes.length < 1) {
                            $scope.getWIPSubfolderContent(data.text, data.type, data.parentNodeDetails);
                        }
                    } else if (data.type == 'StableSubfolder') {

                        if (data.nodes.length < 1) {
                            $scope.getStableubFolderContent(data.text, data.param, data.parentNodeDetails);
                        }
                    } else if (data.type == 'comchop') {

                    } else if (data.type == 'WIPSubFolderGuidecard') {

                        if (data.nodes.length < 1) {
                            $scope.getWIPSubFolderGuidecard(data.text, data.param, data.parentNodeDetails);
                        }
                    }
                },
                onNodeUnselected: function(event, data) {

                    if (data.type == 'comchop') {
                        $scope.isMeta = true;
                    }
                }
            });
        };

        $scope.constructTreeJson = function () {

            $scope.treeData = [];
            angular.forEach($scope.treeDataArray, function (country) {

                var node = {
                    text: country,
                    href: '#parent1',
                    selectable: true,
                    type: 'country',
                    nodes: []
                };
                $scope.treeData.push(node);
            });
            invokeTree();
        };

        $scope.setMetaData = function (data) {

            $scope.fileName = data.fileName;
            var uri = data.parentNodeDetails;
            if (uri.indexOf('WIPSubfolder') > 0) {
                uri = uri.replace('WIPSubfolder', 'WIP');
            } else if (uri.indexOf('StableData') > 0 ) {
                uri = uri.replace('StableData', '');
            }
            uri = uri.replace(/__/gi, '/');
            uri = uri.replace(/--/gi, '/');
            uri = '/' + uri + '/' + data.fileName;
            uri = uri.replace(/\/\//gi, '/');
            var details = uri.split('/');
            var publication = details[3];

            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificTreeview/meta?uri=' + uri + '&publication=' + publication,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.getMetaSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getMetaSuccess = function (response) {

            $scope.isMeta = false;
            $scope.metaDataList = response.data;
        };

        $scope.getCountrySuccess = function (response) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');

            treeDataBaseSet = response.data.treeMap[0].admin1;
            $scope.treeDataArray = response.data.treeMap[0].admin1;
            $scope.constructTreeJson();
        };

        $scope.getContentTypeSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var contentTypeArray = responese.data.countryContentMap;
            var contentTypeNode = $scope.setContentTypeNodeList(contentTypeArray, responese.data.ctNodeHistory);
            $scope.appendContentTypeNode(contentTypeNode, responese.data.ctNodeHistory);
            invokeTree();
        };

        $scope.getPublicationSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var publicationArray = responese.data.publicationMap;
            var publicationNodeArray = $scope.setPublicationNodeList(publicationArray, responese.data.pubNodeHistory);
            $scope.appendPublicationNode(publicationNodeArray, responese.data.pubNodeHistory);
            invokeTree();
        };

        $scope.getStableAndWipSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var stableAndWipNode = responese.data.years.test;
            var parentNodeDetails = responese.data.selectedvalueHierarchy;
            var stableAndWipNodeArray = $scope.setStableAndWip(stableAndWipNode, parentNodeDetails);
            $scope.appendStableAndWipNode(stableAndWipNodeArray, parentNodeDetails);
            invokeTree();
        };

        $scope.getStableContentSuccess = function (responese) {

            var stableContentNode = [];
            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            if ($scope.isWip) {
                stableContentNode = responese.data.wipDataList;
            } else {
                stableContentNode = responese.data.stableDataList;
            }
            var  selectedvalueHierarchy = responese.data.selectedvalueHierarchy;
            stableContentNode.splice(0, 1);
            var stableContentNodeArray = $scope.setStableContent(stableContentNode, selectedvalueHierarchy);
            $scope.appendStableNode(stableContentNodeArray, selectedvalueHierarchy);
            invokeTree();
        };

        $scope.getStableubFolderContentSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var selectedvalueHierarchy = responese.data.selectedvalueHierarchy;
            var selectedStableSubfolderNode = responese.data.statbleSubList;
            var selectedStableSubfolderNodeArray = $scope.setStableSubFolderContent(selectedStableSubfolderNode, selectedvalueHierarchy);
            $scope.appendStableSubFolderNode(selectedStableSubfolderNodeArray, selectedvalueHierarchy);
            invokeTree();
        };

        $scope.getWIPSubFolderGuidecardSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var selectedvalueHierarchy = responese.data.selectedvalueHierarchy;
            var wipSubFolderGuidecard = responese.data.modifiedUriList;
            var wipSubFolderGuidecardArray = $scope.setwipSubFolderGuidecardContent(wipSubFolderGuidecard, selectedvalueHierarchy);
            $scope.appendWipSubFolderGuidecardContentNode(wipSubFolderGuidecardArray, selectedvalueHierarchy);
            invokeTree();
        };

        $scope.getWIPSubfolderContentSuccess = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            var selectedvalueHierarchy = responese.data.selectedvalueHierarchy;
            var selectedWipSubfolderNode = responese.data.iteratorVolumeList;
            var selectedWipSubfolderNodeArray = $scope.setWIPSubFolderContent(selectedWipSubfolderNode, selectedvalueHierarchy);
            $scope.appendWipSubFolderNode(selectedWipSubfolderNodeArray, selectedvalueHierarchy);
            invokeTree();
        };

        $scope.setStableSubFolderContent = function (selectedStableSubfolderNode, parentNodeDetails) {

            var selectedStableSubfolderNodeArray = [];
            angular.forEach(selectedStableSubfolderNode, function (stableSubFolderContent) {

                var text = stableSubFolderContent.NAME;
                node = {
                        text: text,
                        href: ('#' + text),
                        selectable: true,
                        parentNodeDetails: parentNodeDetails,
                        uri: stableSubFolderContent.uri,
                        uriId: stableSubFolderContent.uriId,
                        uriElement: stableSubFolderContent.uriElement,
                        type: stableSubFolderContent.TYPE,
                        icon: 'fa fa-file-code-o text-flat',
                        type: 'comchop'
                    };
                selectedStableSubfolderNodeArray.push(node);
            });
            return selectedStableSubfolderNodeArray;
        };

        $scope.setwipSubFolderGuidecardContent = function (wipSubFolderGuidecardArray, parentNodeDetails) {

            var wipSubFolderGuidecardNodeArray = [];
            angular.forEach(wipSubFolderGuidecardArray, function (wipSubFolderGuidecard) {

                var details = wipSubFolderGuidecard.split('|');
                var param = details[0];
                var text = details[1];
                var uri = details[2];
                var fileDetails = uri.split('/');
                var fileName = fileDetails[6];

                node = {
                        text: text,
                        href: ('#' + text),
                        selectable: true,
                        parentNodeDetails: parentNodeDetails,
                        uri: uri,
                        fileName: fileName,
                        icon: 'fa fa-file-code-o text-flat',
                        type: 'comchop'
                    };
                wipSubFolderGuidecardNodeArray.push(node);
            });
            return wipSubFolderGuidecardNodeArray;
        };

        $scope.setWIPSubFolderContent = function (selectedWipSubfolderNode, parentNodeDetails) {

            var selectedWipSubfolderNodeArray = [];
            angular.forEach(selectedWipSubfolderNode, function (stableContent) {

                var node = {};
                if (stableContent.indexOf('xml') > 1) {

                    var nodeArray = stableContent.split('|');
                    var pathArray = stableContent.split('/');
                    var fileName = pathArray[pathArray.length - 1];
                    var text = nodeArray[1];
                    node = {
                        text: text,
                        href: '#' + text,
                        icon: 'fa fa-file-code-o text-flat',
                        parentNodeDetails: parentNodeDetails,
                        type: 'comchop',
                        param: nodeArray[0],
                        fileName: fileName
                    }
                } else {

                    var nodeArray = stableContent.split('|');
                    var text = nodeArray[1];
                    node = {
                        text: text,
                        href: ('#' + text),
                        selectable: true,
                        parentNodeDetails: parentNodeDetails,
                        type: 'WIPSubFolderGuidecard',
                        param: nodeArray[0],
                        nodes: []
                    }
                }
                selectedWipSubfolderNodeArray.push(node);
            });
            return selectedWipSubfolderNodeArray;
        };

        $scope.setStableContent = function (stableContentNode, parentNodeDetails) {

            var stableContentNodeArray = [];
            angular.forEach(stableContentNode, function (stableContent) {

                var node = {};
                if (stableContent.indexOf('xml') > 1) {

                    var pathArray = stableContent.split('/');
                    var fileName = pathArray[pathArray.length - 1];
                    var nodeArray = stableContent.split('|');
                    var text = nodeArray[1];
                    node = {
                        text: text,
                        href: '#' + text,
                        icon: 'fa fa-file-code-o text-flat',
                        parentNodeDetails: parentNodeDetails,
                        type: 'comchop',
                        param: nodeArray[0],
                        fileName: fileName
                    }
                } else {

                    var text = '';
                    var type = '';
                    var param = '';
                    if ($scope.isWip) {

                        text = stableContent;
                        type = 'WIPSubfolder';
                    } else {

                        var nodeArray = stableContent.split('|');
                        param = nodeArray[0];
                        text = nodeArray[1];
                        type = 'StableSubfolder';
                    }
                    node = {
                        text: text,
                        href: ('#' + text),
                        selectable: true,
                        parentNodeDetails: parentNodeDetails,
                        type: type,
                        param: param,
                        nodes: []
                    }
                }
                stableContentNodeArray.push(node);
            });
            return stableContentNodeArray;
        };

        $scope.appendStableSubFolderNode = function (selectedStableSubfolderNodeArray, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var stable = details[3];
            var param = details[4]
            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {

                    for (i = 0; i < treeNode.nodes.length; i++) {

                        if (treeNode.nodes[i].text == contentType ) {

                           for (j = 0; j < treeNode.nodes[i].nodes.length; j++) {

                                if (treeNode.nodes[i].nodes[j].text == publication) {

                                    for (var k = 0; k < treeNode.nodes[i].nodes[j].nodes.length ; k++) {

                                        if (treeNode.nodes[i].nodes[j].nodes[k].text == stable) {

                                             for (var l = 0; l < treeNode.nodes[i].nodes[j].nodes[k].nodes.length ; l++) {

                                                if (treeNode.nodes[i].nodes[j].nodes[k].nodes[l].param == param) {

                                                    treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes = [];
                                                    treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes = selectedStableSubfolderNodeArray;
                                                    return;
                                                }
                                             }
                                        }
                                    }
                                }
                           }
                       }
                   }
                }
            });
        };

        $scope.appendWipSubFolderNode = function (stableContentNodeArray, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var stable ='WIP';
            var subDetails = details[3].split('--');
            var subFolder = subDetails[2];

            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {

                    for (i = 0; i < treeNode.nodes.length; i++) {

                        if (treeNode.nodes[i].text == contentType ) {

                           for (j = 0; j < treeNode.nodes[i].nodes.length; j++) {

                                if (treeNode.nodes[i].nodes[j].text == publication) {

                                    for (var k = 0; k < treeNode.nodes[i].nodes[j].nodes.length ; k++) {

                                        if (treeNode.nodes[i].nodes[j].nodes[k].text == stable) {

                                             for (var l = 0; l < treeNode.nodes[i].nodes[j].nodes[k].nodes.length ; l++) {

                                                if (treeNode.nodes[i].nodes[j].nodes[k].nodes[l].text == subFolder) {

                                                    treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes = [];
                                                    treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes = stableContentNodeArray;
                                                    return;
                                                }
                                             }
                                        }
                                    }
                                }
                           }
                       }
                   }
                }
            });
        };

        $scope.appendWipSubFolderGuidecardContentNode = function (wipSubFolderGuidecardArray, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var stable ='WIP';
            var subDetails = details[3].split('--');
            var subFolder = subDetails[2];
            var param = details[4];

            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {

                    for (i = 0; i < treeNode.nodes.length; i++) {

                        if (treeNode.nodes[i].text == contentType ) {

                           for (j = 0; j < treeNode.nodes[i].nodes.length; j++) {

                                if (treeNode.nodes[i].nodes[j].text == publication) {

                                    for (var k = 0; k < treeNode.nodes[i].nodes[j].nodes.length ; k++) {

                                        if (treeNode.nodes[i].nodes[j].nodes[k].text == stable) {

                                             for (var l = 0; l < treeNode.nodes[i].nodes[j].nodes[k].nodes.length ; l++) {

                                                if (treeNode.nodes[i].nodes[j].nodes[k].nodes[l].text == subFolder) {

                                                    for (m = 0; m < treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes.length; m++) {

                                                        if (treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes[m].hasOwnProperty('param')
                                                            && treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes[m].param == param) {

                                                            treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes[m].nodes = [];
                                                            treeNode.nodes[i].nodes[j].nodes[k].nodes[l].nodes[m].nodes = wipSubFolderGuidecardArray;
                                                            return;
                                                        }
                                                    }
                                                }
                                             }
                                        }
                                    }
                                }
                           }
                       }
                   }
                }
            });
        };

        $scope.appendStableNode = function (stableContentNode, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var stable = details[3];
            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {

                    for (i = 0; i < treeNode.nodes.length; i++) {

                        if (treeNode.nodes[i].text == contentType ) {

                           for (j = 0; j < treeNode.nodes[i].nodes.length; j++) {

                                if (treeNode.nodes[i].nodes[j].text == publication) {

                                    for (var k = 0; k < treeNode.nodes[i].nodes[j].nodes.length ; k++) {

                                        if (treeNode.nodes[i].nodes[j].nodes[k].text == stable) {

                                            treeNode.nodes[i].nodes[j].nodes[k].nodes = [];
                                            treeNode.nodes[i].nodes[j].nodes[k].nodes = stableContentNode;
                                        }
                                    }
                                }
                           }
                       }
                   }
                }
            });
        };

        $scope.appendStableAndWipNode = function (stableAndWipNodeArray, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {

                    for (i = 0; i < treeNode.nodes.length; i++) {

                        if (treeNode.nodes[i].text == contentType ) {

                           for (j = 0; j < treeNode.nodes[i].nodes.length; j++) {

                                if (treeNode.nodes[i].nodes[j].text == publication) {

                                    treeNode.nodes[i].nodes[j].nodes = [];
                                    treeNode.nodes[i].nodes[j].nodes = stableAndWipNodeArray;
                                }
                           }
                       }
                   }
                }
            });
        };

        $scope.setStableAndWip = function (stableAndWipNode, parentNodeDetails) {

            var stableAndWipNodeArray = [];
            angular.forEach(stableAndWipNode, function (stableAndWip) {

                var node = {
                    text: stableAndWip,
                    href: ('#' + stableAndWip),
                    selectable: true,
                    parentNodeDetails: parentNodeDetails,
                    type: stableAndWip,
                    nodes: []
                }
                stableAndWipNodeArray.push(node);
            });
            return stableAndWipNodeArray;
        };

        $scope.appendPublicationNode = function (publicationNodeArray, parentNodeDetails) {

            var details = parentNodeDetails.split("__");
            var country = details[0];
            var contentType = details[1];
            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == country && treeNode.nodes.length > 0) {
                   for(i = 0; i < treeNode.nodes.length; i++) {
                       if (treeNode.nodes[i].text == contentType ) {

                           treeNode.nodes[i].nodes = [];
                           treeNode.nodes[i].nodes = publicationNodeArray;
                       }
                   }
                }
            });
        };

        $scope.appendContentTypeNode = function (contentTypeNode, parentNode) {

            angular.forEach($scope.treeData, function (treeNode) {

                if (treeNode.text == parentNode) {
                    treeNode.nodes = [];
                    treeNode.nodes = contentTypeNode;
                }
            });
        };

        $scope.setPublicationNodeList = function (publicationArray, nodeDetails) {

            var publicationNodeArray = [];
            var parentNodeDetails = nodeDetails.split("__");
            angular.forEach(publicationArray, function (publication) {

                var res = publication.split("__");
                var text = res[res.length - 1];
                var node = {
                    text: text,
                    href: '#publicationChild',
                    selectable: true,
                    parentNodeDetails: nodeDetails,
                    type: 'publication',
                    nodes: []
                };
                publicationNodeArray.push(node);
            }); 
            return publicationNodeArray;
        };

        $scope.setContentTypeNodeList = function (contentTypeArray, parentNodeDetails) {

            var nodeContentType = [];
            angular.forEach(contentTypeArray, function (contentType) {

                var res = contentType.split("__");
                var text = res[res.length - 1];
                var node = {
                    text: text,
                    href: '#child1',
                    selectable: true,
                    parentNodeDetails: parentNodeDetails,
                    type: 'contentType',
                    nodes: []
                };
                nodeContentType.push(node);
            }); 
            return nodeContentType; 
        };

        $scope.errorResponse = function (response) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            alert("error");
        };

        $scope.init = function () {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var responseData = commonService.serialize({"userName": $scope.userDetails.userName, "password": $scope.userDetails.password});
            $http({
                method: 'POST',
                data: responseData,
                url: 'http://localhost:8080/ECJ_WebApp/treeview/callHome',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response){
                    $scope.getCountrySuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getContentType = function (country) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var responseData = commonService.serialize({
                                "userName": $scope.userDetails.userName,
                                "password": $scope.userDetails.password,
                                "country": country});
             $http({
                method: 'POST',
                data: responseData,
                url: 'http://localhost:8080/ECJ_WebApp/treeview/contentType',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response){
                    $scope.getContentTypeSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getPublication = function (contentType, country) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var responseData = commonService.serialize({
                                "userName": $scope.userDetails.userName,
                                "password": $scope.userDetails.password,
                                "country": country,
                                "contentType": contentType});
             $http({
                method: 'POST',
                data: responseData,
                url: 'http://localhost:8080/ECJ_WebApp/treeview/publication',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response){
                    $scope.getPublicationSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getStableAndWip = function (publication, parentNodeDetails) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var details = parentNodeDetails.split('__');
            var country = details[0];
            var contentType = details[1];
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/treeview/year?country=' + country + '&contentType=' + contentType + '&publication=' + publication,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response){
                    $scope.getStableAndWipSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getStableAndWipContent = function (stableAndWip, parentNodeDetails) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var details = parentNodeDetails.split('__');
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificTreeview/volume?country=' + country + '&contentType=' + contentType + '&publication=' + publication + '&year=' + stableAndWip,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {

                    if (stableAndWip == 'StableData') {
                        $scope.isWip = false;
                    } else {
                        $scope.isWip = true;
                    }
                        $scope.getStableContentSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getWIPSubFolderGuidecard = function (WipSubFolderText, param, parentNodeDetails) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var details = parentNodeDetails.split('__');
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var val = details[3];
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificTreeview/wipPart?country=' + country + '&contentType=' + contentType + '&publication=' + publication + '&year=' + val + '&volume=' + param,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.getWIPSubFolderGuidecardSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getStableubFolderContent = function (stableSubFolderText, param, parentNodeDetails) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var details = parentNodeDetails.split('__');
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var val = details[3];
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificTreeview/part?country=' + country + '&contentType=' + contentType + '&publication=' + publication + '&year=' + val + '&volume=' + param,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.getStableubFolderContentSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getWIPSubfolderContent = function (WIPSubfolderText, type, parentNodeDetails) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var details = parentNodeDetails.split('__');
            var country = details[0];
            var contentType = details[1];
            var publication = details[2];
            var wip = details[3];
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificTreeview/getWipVolume?country=' + country + '&contentType=' + contentType + '&publication=' + publication + '&year=--' + wip + 'Subfolder--' + WIPSubfolderText,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.getWIPSubfolderContentSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.addendRightClickMenuList = function (responese) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            if (!$scope.isStableMenu) {
                $scope.stableRightClickMenuList = responese.data.tools;
            } else if (!$scope.isWipMenu) {
                $scope.wipRightClickMenuList = responese.data.tools;
            }
        };

        $scope.getRightClickMenuAtStableAndWIPLevel = function (data) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var fullUri = 'sp__' + data.parentNodeDetails + '__' + data.text;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificPrevileges/toolsRights?fullUri=' + fullUri + '&roleId=' + $scope.userDetails.roleId, 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.addendRightClickMenuList(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getRightClickMenuAtWipIssueLevel = function (data) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var uriDetails = data.parentNodeDetails.split('__');
            var uri = uriDetails[0] + '__' + uriDetails[1] + '__' + uriDetails[2] + '__';
            var fullUri = 'spISSUE__' + uri + '--' + data.type + '--' + data.text;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificPrevileges/toolsRights?fullUri=' + fullUri + '&roleId=' + $scope.userDetails.roleId, 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.addendRightClickMenuList(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getRightClickMenuAtWipCommchapLevel = function (data) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var fullUri = 'spURI__' + data.parentNodeDetails + '__0__0__' + data.param;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificPrevileges/toolsRights?fullUri=' + fullUri + '&roleId=' + $scope.userDetails.roleId, 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.addendRightClickMenuList(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.getRightClickMenuAtGuidecardevel = function (data) {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            var fullUri = 'spguidecard__' + data.parentNodeDetails + '__' + data.param;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificPrevileges/toolsRights?fullUri=' + fullUri + '&roleId=' + $scope.userDetails.roleId, 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.addendRightClickMenuList(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.actionOnMenuClick = function (menu) {

            
            $scope.subFolder = '';
            $scope.menuName = menu;
            $('#getFolderPopup').modal('show');
        };

        $scope.actionOnStableRightClickMenuSuccess = function (response) {

            $scope.helpers.uiBlocks('#tree-block', 'state_normal');
            if (response.data == 'File/Folder is locked by other user. Please try later') {
                swal('Warning', response.data, 'warning');
            } else {
                swal('Success', response.data, 'success');
            }
        };

        $scope.actionOnStableRightClickMenu = function () {

            $scope.helpers.uiBlocks('#tree-block', 'state_loading');
            $('#getFolderPopup').modal('hide');
            var uriDetails = $scope.selectedNode.parentNodeDetails.split('__');
            var uri = '/' + uriDetails[0] + '/' + uriDetails[1] + '/' + uriDetails[2] + '/' + $scope.selectedNode.fileName;
            var fullUri = 'spURI__' + $scope.selectedNode.parentNodeDetails + '__0__0__' + $scope.selectedNode.param;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificClientTools/copyOrMoveOrPostXML?uri=' + uri + '&copyOrMove=' + $scope.menuName + '&fullId=' + fullUri + '&subFolder=' + $scope.subFolder + '&category=single&userId=' + $scope.userDetails.userId, 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.actionOnStableRightClickMenuSuccess(response);
                }, function (response) {
                    $scope.errorResponse(response);
            });
        };

        $scope.actionOnWipMenuClickSuccess = function (response) {
            swal('Success', response.data, 'success');
        };

        $scope.errorToolResponse = function (response) {
            swal('Error', response.data.Error, 'error');
        };
        $scope.actionOnWipMenuClick = function (menu) {

            var uriDetails = $scope.selectedNode.parentNodeDetails.split('__');
            var issueLevelDetails = uriDetails[3].split('--');
            var uri = '/' + uriDetails[0] + '/' + uriDetails[1] + '/' + uriDetails[2] + '/' + 'WIP' + '/' + issueLevelDetails[2] + '/' + $scope.selectedNode.fileName;
            var fullUri = 'spURI__' + $scope.selectedNode.parentNodeDetails + '__0__0__' + $scope.selectedNode.param;
            $http({
                method: 'GET',
                url: 'http://localhost:8080/ECJ_WebApp/pacificClientTools/commonToolInvoker?id=' + fullUri + '&uri=' + uri + '&userId=' + $scope.userDetails.userId + '&userName=' + $scope.userDetails.userName + '&key=' + menu + '&category=single&importPath', 
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(response) {
                    $scope.actionOnWipMenuClickSuccess(response);
                }, function (response) {
                    $scope.errorToolResponse(response);
            });
        };

        $scope.init();
    }
]);
