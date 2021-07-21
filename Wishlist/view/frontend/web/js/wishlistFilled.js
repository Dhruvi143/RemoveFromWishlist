require(
    [
    'jquery',
    'underscore',
    'Magento_Customer/js/customer-data',
    'mage/url',
    'domReady!'
    ],
    function ($, _, customerData, url) {
        'use strict';
        window.url = url;
        var sections = ['wishlist'];
        customerData.invalidate(sections);
        customerData.reload(sections, true);
        if (!window.location.href.includes('/checkout') ||
            window.location.href.includes('/checkout/cart')) {
            $(function () {
                let wishlistedItemsIds      = [];
                let wishlist                = '';
                let wishlistItems           = '';
                let wishlistBtnSelector     = '[data-action="add-to-wishlist"]';
                let wishlistRemovePostData  = [];
                let wishlistRemoveSelector  = '.wishlist-remove-link[data-role="remove"]';
                let wishlistbtns = $(document).find(wishlistBtnSelector);
                _.each(wishlistbtns, function (item) {
                    let itemSelector = $(item);
                    let addProductToFavourites = 'Add to My Wishlist';
                    if ($.mage.__ !== undefined) {
                        addProductToFavourites = $.mage.__('Add to My Wishlist');
                    }
                    itemSelector.removeClass('active-wishlist');
                    itemSelector.attr('title', addProductToFavourites)
                        .find('span').text(addProductToFavourites);
                });
                wishlist = customerData.get('wishlist');
                wishlist.subscribe(function (newValue) {
                    reloadWishlistedData();
                });

                    _.defer(function () {
                        reloadWishlistedData();
                    }, 500);

                function reloadWishlistedData()
                {
                    wishlistItems = wishlist().items;

                    if (wishlistItems !== undefined && wishlistItems.length > 0) {
                        _.each(wishlistItems, function (item) {
                            wishlistedItemsIds.push(parseInt(item.product_id));
                            wishlistRemovePostData[parseInt(item.product_id)] = item.delete_item_params;
                        });
                        fillHeart();
                    }
                }

                    /**
                     * If Product is added
                     */
                function fillHeart()
                {
                    let wishlistbtns = $(document).find(wishlistBtnSelector);
                    _.each(wishlistbtns, function (item) {
                        let itemSelector = $(item);
                        let productId = itemSelector.data('post').data.product;
                        if (productId && productId > 0) {
                            if (_.contains(wishlistedItemsIds, productId) ||
                                _.contains(wishlistedItemsIds, parseInt(productId))) {
                                itemSelector.addClass('wishlist-filled');
                                if (wishlistRemovePostData !== undefined && wishlistRemovePostData[productId] !== '') {
                                    itemSelector.addClass('active-wishlist');
                                    itemSelector.text();
                                    itemSelector.attr('data-role', 'remove')
                                        .removeAttr('data-post')
                                        .removeAttr('data-action')
                                        .attr('data-post-remove', wishlistRemovePostData[productId])
                                        .attr('title', $.mage.__('Remove from My Wishlist'))
                                        .addClass('btn-remove delete wishlist-remove-link')
                                        .find('span').text($.mage.__('Remove from My Wishlist'));
                                }
                            } else {
                                itemSelector.removeClass('wishlist-filled');
                            }
                        }
                    });
                }

                function getQueryStringPrarams(url = '')
                {
                    let result = {};
                    if (url === '') {
                        if (window.location.search !== "") {
                            const urlParams = new URLSearchParams(window.location.search);
                            let keys = urlParams.keys();
                            for (let key of keys) {
                                result[key] = urlParams.get(key);
                            }
                        }
                    } else {
                        let parmas = '';
                        url = url.split('?');
                        parmas = url[url.length -1];
                        if (parmas !== "") {
                            const urlParams = new URLSearchParams(parmas);
                            let keys = urlParams.keys();
                            for (let key of keys) {
                                result[key] = urlParams.get(key);
                            }
                        }
                    }
                    return result;
                }

                    /**
                     * Reload Wishlist after applied layered navigation filter
                     */
                    $(document).ajaxComplete(function (event, xhr, settings) {
                        let params = {};
                        params = getQueryStringPrarams(settings.url);
                        if (_.keys(params).length > 0 && params.shopbyAjax === 1) {
                            reloadWishlistedData();
                        }
                    });

                    /**
                     * Remove From Wishlist When Heart is Filled
                     */
                    $(document).on('click', wishlistRemoveSelector, $.proxy(function (event) {
                        event.preventDefault();
                        $.mage.dataPost().postData($(event.currentTarget).data('post-remove'));

                    }, this));
            });
        }
    }
);
