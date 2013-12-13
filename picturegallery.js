/**
 * Pure javascript picture gallery for Titanium
 * Copyright (c) 2011 by Novelys and other contributors
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = (function() {
	return {
	    createWindow: function(dictionary) {
    
        // ------- Variable declaration -------
        var
    
        /** Wether or not 'user-interface' is displayed in scrollable gallery mode. */
        isUiHidden = false,
    
        /** Images (ImageView) displayed by the scrollable gallery. */
        galleryImageViews = [],
        
        originalImages = [],
    
        /** Window managing the scrollable gallery */
        galleryWindow = null,
    
        /** Window managing the thumb gallery */
        thumbGalleryWindow = null,
    
        // iOS only --------------------
        /** Optional window wrapping a navigation group */
        navigationWrappingWindow = null,
    
        /** Navigation group */
        navigation = null,
        // -----------------------------
    
        /** Thumbnail gallery view */
        thumbnailScrollView = null,
    
        /** Number of column in the thumbnail gallery */
        numberOfColumn = 0,
    
        /** Thumbnail padding in gallery gallery */
        thumbPadding = 0,
    
        /** Size of the thumbnail in thumbnail gallery */
        thumbSize = 0,
    
        /**
         * Density per inch factor. Useful for retina
         * display and multiple android resolutions.
         */
        dpi = (Ti.Platform.displayCaps.dpi / 160),
    
        /** Scrollable view holding pictures */
        scrollableGalleryView = null,
    
        // UI
        /** Label holding image caption */
        descriptionLabel = null,
    
        /** Left button on gallery */
        buttonLeft = null,
    
        /** Right button on gallery */
        buttonRight = null,
    
        /** Buttons size */
        buttonSize = {
            width : 25,
            height : 50
        };
    
        // ------- Default parameters -------
        // Assign a default value to every unspecified value.
        dictionary = ( typeof dictionary == 'undefined') ? {} : dictionary;
    
        dictionary.images = ( typeof dictionary.images == 'undefined') ? [] : dictionary.images;
    
        dictionary.thumbGallery = ( typeof dictionary.thumbGallery == 'undefined') ? {} : dictionary.thumbGallery;
        dictionary.scrollableGallery = ( typeof dictionary.scrollableGallery == 'undefined') ? {} : dictionary.scrollableGallery;
    
        dictionary.thumbGallery.numberOfColumn = ( typeof dictionary.thumbGallery.numberOfColumn == 'undefined') ? 4 : dictionary.thumbGallery.numberOfColumn;
        dictionary.thumbGallery.numberOfColumnPortrait = ( typeof dictionary.thumbGallery.numberOfColumnPortrait == 'undefined') ? dictionary.thumbGallery.numberOfColumn : dictionary.thumbGallery.numberOfColumnPortrait;
        dictionary.thumbGallery.numberOfColumnLandscape = ( typeof dictionary.thumbGallery.numberOfColumnLandscape == 'undefined') ? dictionary.thumbGallery.numberOfColumn : dictionary.thumbGallery.numberOfColumnLandscape;
    
        dictionary.thumbGallery.forceRealPixelSize = ( typeof dictionary.thumbGallery.forceRealPixelSize == 'undefined') ? false : dictionary.thumbGallery.forceRealPixelSize;
    
        dictionary.thumbGallery.thumbSize = ( typeof dictionary.thumbGallery.thumbSize == 'undefined') ? 0 : dictionary.thumbGallery.thumbSize;
        dictionary.thumbGallery.thumbPadding = ( typeof dictionary.thumbGallery.thumbPadding == 'undefined') ? 4 : dictionary.thumbGallery.thumbPadding;
        dictionary.thumbGallery.thumbBorderColor = ( typeof dictionary.thumbGallery.thumbBorderColor == 'undefined') ? '#999999' : dictionary.thumbGallery.thumbBorderColor;
        dictionary.thumbGallery.thumbBorderWidth = ( typeof dictionary.thumbGallery.thumbBorderWidth == 'undefined') ? 1 : dictionary.thumbGallery.thumbBorderWidth;
        dictionary.thumbGallery.thumbBorderRadius = ( typeof dictionary.thumbGallery.thumbBorderRadius == 'undefined') ? 0 : dictionary.thumbGallery.thumbBorderRadius;
        dictionary.thumbGallery.thumbBackgroundColor = ( typeof dictionary.thumbGallery.thumbBackgroundColor == 'undefined') ? '#FFFFFF' : dictionary.thumbGallery.thumbBackgroundColor;
    
        dictionary.thumbGallery.backgroundColor = ( typeof dictionary.thumbGallery.backgroundColor == 'undefined') ? '#EEEEEE' : dictionary.thumbGallery.backgroundColor;
    
        dictionary.scrollableGallery.labelColor = ( typeof dictionary.scrollableGallery.labelColor == 'undefined') ? '#FFFFFF' : dictionary.scrollableGallery.labelColor;
        dictionary.scrollableGallery.labelFont = ( typeof dictionary.scrollableGallery.labelFont == 'undefined') ? {fontSize : 18, fontWeight : 'bold'} : dictionary.scrollableGallery.labelFont;
        dictionary.scrollableGallery.barColor = ( typeof dictionary.scrollableGallery.barColor == 'undefined') ? '#000' : dictionary.scrollableGallery.barColor;
        dictionary.scrollableGallery.translucent = ( typeof dictionary.scrollableGallery.translucent == 'undefined') ? false : dictionary.scrollableGallery.translucent;
    
        dictionary.scrollableGallery.displayArrows = ( typeof dictionary.scrollableGallery.displayArrows == 'undefined') ? false : dictionary.scrollableGallery.displayArrows;
        dictionary.scrollableGallery.displayCaption = ( typeof dictionary.scrollableGallery.displayCaption == 'undefined') ? true : dictionary.scrollableGallery.displayCaption;
        
        dictionary.scrollableGallery.i18nOfKey = ( typeof dictionary.scrollableGallery.i18nOfKey == 'undefined') ? ' of ' : dictionary.scrollableGallery.i18nOfKey;
    
        dictionary.title = ( typeof dictionary.title == 'undefined') ? 'Gallery' : dictionary.title;
    
        // ------- Methods -------
        /**
         * Check wether or not the platform is android. ifnot
         * platform will be considered as an iOS one.
         *
         * @return {Boolean} true ifthe platform is an Android one, false otherwise.
         */
        var isAndroidDevice = function() {
            return (Ti.Platform.name === 'android')
        };
        
        /**
         * Recompute the size of thumbnails in gallery.
         */
        var computeSizesforThumbGallery = function() {
            numberOfColumn = dictionary.thumbGallery.numberOfColumn;
    
            if (Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight) {// Landscape
                numberOfColumn = dictionary.thumbGallery.numberOfColumnLandscape;
            } else {
                numberOfColumn = dictionary.thumbGallery.numberOfColumnPortrait;
            }
    
            if (dictionary.thumbGallery.thumbSize === 0) {
                // No size specified, use padding (or default padding)
                // to create thumbnail size.
                thumbPadding = (dictionary.thumbGallery.thumbPadding);
                thumbSize = (Ti.Platform.displayCaps.platformWidth - ((numberOfColumn + 1) * thumbPadding)) / numberOfColumn;
            } else {
                var thumbsizeDpi;
    
                if (dictionary.thumbGallery.forceRealPixelSize) {
                    // force size in pixel rather than 'density pixels'
                    thumbsizeDpi = dictionary.thumbGallery.thumbSize;
                } else {
                    thumbsizeDpi = dictionary.thumbGallery.thumbSize * dpi;
                }
    
                if ((thumbsizeDpi * numberOfColumn) > Ti.Platform.displayCaps.platformWidth) {
                    // ifvalues specified are incoherent (i. e. overlap screen), reduce values
                    // to get in the screen boundaries.
                    thumbSize = thumbsizeDpi - (numberOfColumn * 1) -
                        ((thumbsizeDpi * numberOfColumn - Ti.Platform.displayCaps.platformWidth) / numberOfColumn);
                } else {
                    thumbSize = thumbsizeDpi;
                }
    
                // Compute padding.
                thumbPadding = (Ti.Platform.displayCaps.platformWidth - (numberOfColumn * thumbSize)) / (numberOfColumn + 1);
            }
    
        };
        
        /**
         * Recompute the size of a given image size, in order to make it fit
         * into the screen.
         *
         * @param {Number} width
         *
         * @param {Number} height
         *
         * @returns {Object} new width and the new height.
         */
        var reComputeImageSize = function(width, height) {
            
            var newWidth = width, 
                newHeight = height;
                    
            /*
             * By working ratios of image sizes and screen sizes we ensure that, we will always
             * start resizing the dimension (height or width) overflowing the screen. Thus, the resized image will
             * always be contained by the screen boundaries.
             */
            if ((width / Ti.Platform.displayCaps.platformWidth) >= (height / Ti.Platform.displayCaps.platformHeight)) {

                if (width > Ti.Platform.displayCaps.platformWidth) {
                    newHeight = (height * Ti.Platform.displayCaps.platformWidth) / width;
                    newWidth = Ti.Platform.displayCaps.platformWidth;
    
                } else if (height > Ti.Platform.displayCaps.platformHeight) {
                    newWidth = (width * Ti.Platform.displayCaps.platformHeight) / height;
                    newHeight = Ti.Platform.displayCaps.platformHeight;
                }
    
            } else {

                if (height > Ti.Platform.displayCaps.platformHeight) {
                    newWidth = (width * Ti.Platform.displayCaps.platformHeight) / height;
                    newHeight = Ti.Platform.displayCaps.platformHeight;
    
                } else if (width > Ti.Platform.displayCaps.platformWidth) {
                    newHeight = (height * Ti.Platform.displayCaps.platformWidth) / width;
                    newWidth = Ti.Platform.displayCaps.platformWidth;
                }
    
            }
            
            return {
                width : newWidth,
                height : newHeight
            };
    
        };
        
        /**
         * Recompute thumbnails size on orientation change.
         */
        var reComputeImageGalleryOnOrientationChange = function() {

            computeSizesforThumbGallery();
    
            var currentColumn = 0;
            var currentRow = 0;
            var yPosition = thumbPadding;
            var xPosition = thumbPadding;
    
            for (var i = 0, b = thumbnailScrollView.children.length; i < b; i++) {
    
                if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
                    xPosition = thumbPadding;
                    yPosition += thumbPadding + thumbSize;
                    currentRow++;
                }
    
                var currentThumb = thumbnailScrollView.children[i];
    
                currentThumb.width = thumbSize;
                currentThumb.height = thumbSize;
    
                currentThumb.left = xPosition;
                currentThumb.top = yPosition;
    
                var dpifactor = dpi;
                if (dictionary.thumbGallery.forceRealPixelSize) {
                    dpifactor = 1;
                }
    
                currentThumb.children[0].width = (thumbSize - (6 * dpifactor));
                currentThumb.children[0].height = (thumbSize - (6 * dpifactor));
    
                currentThumb.children[0].top = (3 * dpifactor);
                currentThumb.children[0].left = (3 * dpifactor);
    
                // Increments values (thumb layout)
                currentColumn++;
                xPosition += thumbSize + thumbPadding;
            }
        };
        
        /**
         * Recompute image size on orientation change.
         */
        var reComputeImageSizeOnChange = function(index) {
            newSize = reComputeImageSize(dictionary.images[index].width, dictionary.images[index].height);

            scrollableGalleryView.views[index].height = newSize.height;
            scrollableGalleryView.views[index].width = newSize.width;
        };
        
        /**
         * Recompute images size on orientation change.
         */
        var reComputeImagesSizeOnChange = function() {
    
            // Iterating through gallery images.
            for (var i = 0, length = dictionary.images.length; i < length; i++) {
                reComputeImageSizeOnChange(i);
            }
            
            if (dictionary.scrollableGallery.displayArrows) {
                buttonRight.top = (Ti.Platform.displayCaps.platformHeight / 2 - 25 * dpi);
                buttonLeft.top = (Ti.Platform.displayCaps.platformHeight / 2 - 25 * dpi);
            }
        };
        
        
        /**
         * Create thumbnail gallery.
         */
        var createThumbGallery = function() {
            thumbnailScrollView = Ti.UI.createScrollView({
                top: 0,
                
                contentWidth: 'auto',
                contentHeight: 'auto',
    
                showVerticalScrollIndicator: true,
                showHorizontalScrollIndicator: false,

                backgroundColor: dictionary.thumbGallery.backgroundColor
            });
    
            computeSizesforThumbGallery();
    
            // Laying out thumbnails
            var currentColumn = 0;
            var currentRow = 0;
            var yPosition = thumbPadding;
            var xPosition = thumbPadding;
    
            for (var i = 0, b = dictionary.images.length; i < b; i++) {
    
                if (currentColumn % numberOfColumn === 0 && currentColumn > 0) {
                    xPosition = thumbPadding;
                    yPosition += thumbPadding + thumbSize;
                    currentRow++;
                }
    
                // Border of the thumbnail (make the thumbnail look a bit like a real picture).
                var thumbImageBorder = Ti.UI.createView({
    
                    width : thumbSize,
                    height : thumbSize,
    
                    imageId : i,
    
                    left : xPosition,
                    top : yPosition,
    
                    backgroundColor : dictionary.thumbGallery.backgroundColor
    
                });
    
                var thumbPath = (typeof dictionary.images[i].thumbPath == 'undefined') ?
                                 dictionary.images[i].path :
                                 dictionary.images[i].thumbPath;
    
                var dpifactor = dpi;
                if (dictionary.thumbGallery.forceRealPixelSize) {
                    dpifactor = 1;
                }
    
                var thumbImage = Ti.UI.createImageView({
    
                    image : thumbPath,
                    defaultImage:'../images/default_background.png',
                    hires:true,
                    imageId : i,
    
                    width : (thumbSize - (6 * dpifactor)),
                    height : (thumbSize - (6 * dpifactor)),
    
                    top : (3 * dpifactor),
                    left : (3 * dpifactor)
    
                });
    
                thumbImageBorder.borderColor = dictionary.thumbGallery.thumbBorderColor;
                thumbImageBorder.borderWidth = dictionary.thumbGallery.thumbBorderWidth;
                thumbImageBorder.backgroundColor = dictionary.thumbGallery.thumbBackgroundColor;
    
                thumbImageBorder.add(thumbImage);
    
                thumbImageBorder.addEventListener('click', function(e) {
                    var loading = Ti.UI.createView({
                        height: Ti.UI.FILL,
                        width: Ti.UI.FILL,
                        backgroundColor: 'black',
                        opacity:0.1,
                    });
                    var actInd = Titanium.UI.createActivityIndicator({
                        style:Ti.UI.iPhone.ActivityIndicatorStyle.BIG
                    });
                    loading.add(actInd);
                    actInd.show();
                    thumbnailScrollView.add(loading);
                    
                    galleryWindow = Ti.UI.createWindow({
                        backgroundColor : '#000',
                        title : (e.source.imageId + 1) + L(dictionary.scrollableGallery.i18nOfKey, ' of ') + dictionary.images.length,
                        translucent : false
                    });
    
                    // Add a listener on orientation change...
                    Ti.Gesture.addEventListener('orientationchange', reComputeImagesSizeOnChange);
    
                    // ... But remove listener from pool on close.
                    galleryWindow.addEventListener('close', function() {
                        Ti.Gesture.removeEventListener('orientationchange', reComputeImagesSizeOnChange);
                    });
                    
                    if (dictionary.scrollableGallery.barColor !== 'undefined') {
                        galleryWindow.barColor = dictionary.scrollableGallery.barColor;
                    }
    
                    createGalleryWindow(e.source.imageId);
                    
                    actInd.hide();
                    thumbnailScrollView.remove(loading);
    
                    if (isAndroidDevice()) {
                        galleryWindow.open({
                            fullscreen : true,
                            navBarHidden : true
                        });
                    } else {
                        //Titanium.UI.iPhone.statusBarStyle = Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK;
                        if ( typeof dictionary.windowGroup == 'undefined') {
                            navigation.openWindow(galleryWindow);
                        } else {
                            dictionary.windowGroup.openWindow(galleryWindow);
                        }
                    }
                });
    
                thumbnailScrollView.add(thumbImageBorder);
    
                // Increments values (thumb layout)
                currentColumn++;
                xPosition += thumbSize + thumbPadding;
    
            }
            thumbGalleryWindow.add(thumbnailScrollView);
        };
        
        
        /**
         * Create the scrollable gallery view
         *
         * @param {Number} imageId id of the image first displayed
         */
        var createGalleryWindow = function(imageId) {
            
            scrollableGalleryView = Ti.UI.createScrollableView({
    
                top : 0,
                views : [],
    
                showPagingControl : false,
                maxZoomScale : 2.0,
    
                currentPage : imageId
    
            });
    
            // Create caption only when given by user.
            var descriptionLabel = null;

            descriptionLabel = Ti.UI.createLabel({

                text : dictionary.images[imageId].caption,

                bottom : '15dp',
                height : 'auto',

                color : dictionary.scrollableGallery.labelColor,

                font : dictionary.scrollableGallery.labelFont,

                textAlign : 'center',

                zIndex : 2,
            });
    
            if (dictionary.scrollableGallery.displayArrows) {
    
                if (isAndroidDevice) {
                    buttonLeft = Titanium.UI.createButton({
                        image : '../images/gallery/left_arrow.png',
                        backgroundImage : '../images/gallery/invisible_hack.png',
                        left : 10,
                        width : buttonSize.width * dpi,
                        height : buttonSize.height * dpi,
                        top : (Ti.Platform.displayCaps.platformHeight / 2 - (buttonSize.height / 2 * dpi))
                    });
                    buttonRight = Titanium.UI.createButton({
                        image : '../images/gallery/right_arrow.png',
                        backgroundImage : '../images/gallery/invisible_hack.png',
                        right : 10,
                        width : buttonSize.width * dpi,
                        height : buttonSize.height * dpi,
                        top : (Ti.Platform.displayCaps.platformHeight / 2 - (buttonSize.height / 2 * dpi))
                    });
                } else {
                    buttonLeft = Titanium.UI.createButton({
                        image : '../images/gallery/left_arrow.png',
                        backgroundImage : '../images/gallery/invisible_hack.png',
                        left : 10,
                        width : buttonSize.width * dpi,
                        height : buttonSize.height * dpi,
                        top : (Ti.Platform.displayCaps.platformHeight / 2 - (buttonSize.height / 2 * dpi))
                    });
                    buttonRight = Titanium.UI.createButton({
                        image : '../images/gallery/right_arrow.png',
                        backgroundImage : '../images/gallery/invisible_hack.png',
                        right : 10,
                        width : buttonSize.width * dpi,
                        height : buttonSize.height * dpi,
                        top : (Ti.Platform.displayCaps.platformHeight / 2 - (buttonSize.height / 2 * dpi))
                    });
                }
    
                buttonLeft.addEventListener('click', function(e) {
                    var i = scrollableGalleryView.currentPage;
                    if (i === 0) {
                        return;
                    }
                    i--;
    
                    scrollableGalleryView.scrollToView(i);
                });
    
                buttonRight.addEventListener('click', function(e) {
                    var i = scrollableGalleryView.currentPage;
                    if (i === (scrollableGalleryView.views.length - 1)) {
                        return;
                    }
                    i++;
    
                    scrollableGalleryView.scrollToView(i);
                });
            }
    
            /**
             * Toogle caption, navigation arrows and title bar.
             */
            var toogleUI = function() {
    
                if (isUiHidden) {
                    if (!isAndroidDevice()) {
                        galleryWindow.showNavBar();
                    }
    
                    var animation = Titanium.UI.createAnimation();
                    animation.duration = 300;
                    animation.opacity = 1.0;
                    
                    if (descriptionLabel != null)
                        descriptionLabel.animate(animation);
    
                    if (dictionary.scrollableGallery.displayArrows) {
                        if (scrollableGalleryView.currentPage !== (scrollableGalleryView.views.length - 1)) {
                            buttonRight.animate(animation);
                        }
    
                        if (scrollableGalleryView.currentPage !== 0) {
                            buttonLeft.animate(animation);
                        }
                    }
                } else {
                    if (!isAndroidDevice()) {
                        galleryWindow.hideNavBar();
                    }
    
                    var animation = Titanium.UI.createAnimation();
                    animation.duration = 300;
                    animation.opacity = 0.0;
    
                    if (descriptionLabel != null)
                        descriptionLabel.animate(animation);
    
                    if (dictionary.scrollableGallery.displayArrows) {
                        if (scrollableGalleryView.currentPage !== (scrollableGalleryView.views.length - 1)) {
                            buttonRight.animate(animation);
                        }
    
                        if (scrollableGalleryView.currentPage !== 0) {
                            buttonLeft.animate(animation);
                        }
                    }
                }
                isUiHidden = !isUiHidden;
    
            };
            if (isAndroidDevice()) {
    
                for (var i = 0, b = dictionary.images.length; i < b; i++) {
                    tempImg = Ti.UI.createImageView({
                        image : dictionary.images[i].path,

                        width : 'auto',
                        height : 'auto'
                    });

                    // Hack on android to get image size.
                    // TODO: Find a better way...
                    var tempBlob = tempImg.toImage();

                    dictionary.images[i].height = tempBlob.height;
                    dictionary.images[i].width = tempBlob.width;

                    var view = Ti.UI.createImageView({
                        backgroundColor : '#000',
                        image : dictionary.images[i].path,
                    });
    
                    galleryImageViews[i] = view;
    
                    // Not very optimized... But Android scrollableView does not respond to tap event.
                    // Views in the other hand, do.
                    view.addEventListener('singletap', toogleUI);
    
                }
    
                scrollableGalleryView.views = galleryImageViews;
                
                reComputeImagesSizeOnChange();
    
                galleryWindow.add(scrollableGalleryView);
    
            } else {
    
                for (var i = 0, b = dictionary.images.length; i < b; i++) {
    
                    var view = Ti.UI.createImageView({
                        backgroundColor : '#000',
    
                        image : dictionary.images[i].path,
                        defaultImage:'../images/default_background.png',
    
                        height : 'auto',
                        width : 'auto',
                        
                        index: i,
                        
                        firstLoad: true
    
                    });
                    
                    view.addEventListener('load', function (e) {
                        var blob = e.source.toBlob();
                        originalImages[e.source.index] = blob;
                        
                        if (blob.height > 0 && blob.width > 0) {
                            dictionary.images[e.source.index].height = blob.height;
                            dictionary.images[e.source.index].width = blob.width;
                            
                            if (e.source.firstLoad) {
                                reComputeImageSizeOnChange(e.source.index);
                            }
                            
                            e.source.firstLoad = false;
                        }
                    });
    
                    dictionary.images[i].height = view.size.height;
                    dictionary.images[i].width = view.size.width;
    
                    view.addEventListener('singletap', toogleUI);
    
                    galleryImageViews[i] = view;
                }
    
                scrollableGalleryView.views = galleryImageViews;
    
                galleryWindow.add(scrollableGalleryView);
            }
    
            if (descriptionLabel !== null) {
                galleryWindow.add(descriptionLabel);
            }
    
            if (dictionary.scrollableGallery.displayArrows) {
                galleryWindow.add(buttonLeft);
                galleryWindow.add(buttonRight);
    
                if (imageId === (scrollableGalleryView.views.length - 1)) {
                    buttonRight.visible = false;
                }
    
                if (imageId === 0) {
                    buttonLeft.visible = false;
                }
            }
    
            scrollableGalleryView.addEventListener('scroll', function(e) {
    
                galleryWindow.title = e.currentPage + 1 + L(dictionary.scrollableGallery.i18nOfKey, ' of ') + dictionary.images.length;
                
                if (typeof dictionary.images[e.currentPage].caption == 'undefined' || dictionary.images[e.currentPage].caption == 'undefined') {
                    dictionary.images[e.currentPage].caption = '';
                }

                if (descriptionLabel != null) {
                    descriptionLabel.text = dictionary.images[e.currentPage].caption;
                }
    
                if (!isUiHidden) {
                    if (e.currentPage === (scrollableGalleryView.views.length - 1)) {
                        if (dictionary.scrollableGallery.displayArrows)
                            buttonRight.visible = false;
                    } else {
                        if (dictionary.scrollableGallery.displayArrows)
                            buttonRight.visible = true;
                    }
    
                    if (e.currentPage === 0) {
                        if (dictionary.scrollableGallery.displayArrows)
                            buttonLeft.visible = false;
                    } else {
                        if (dictionary.scrollableGallery.displayArrows)
                            buttonLeft.visible = true;
                    }
                }
            });
        };
        
        
        thumbGalleryWindow = Ti.UI.createWindow({
            title : dictionary.title,
            barColor: dictionary.barColor,
            translucent: dictionary.translucent,
            dummy: dictionary.dummy
        });
    
        thumbGalleryWindow.orientationModes = [
            Titanium.UI.LANDSCAPE_LEFT,
            Titanium.UI.LANDSCAPE_RIGHT,
            Titanium.UI.PORTRAIT,
            Titanium.UI.UPSIDE_PORTRAIT
        ];
    
        if (!isAndroidDevice()) {
            if (typeof dictionary.windowGroup == 'undefined') {
                navigationWrappingWindow = Ti.UI.createWindow({
                    title : dictionary.title,
                });
                navigation = Ti.UI.iOS.createNavigationWindow({
                    window : thumbGalleryWindow
                });
    
                navigationWrappingWindow.add(navigation);
                
                navigationWrappingWindow.orientationModes = [
                    Titanium.UI.LANDSCAPE_LEFT,
                    Titanium.UI.LANDSCAPE_RIGHT,
                    Titanium.UI.PORTRAIT,
                    Titanium.UI.UPSIDE_PORTRAIT
                ];
            } else {
                navigationWrappingWindow = thumbGalleryWindow;
            }
    
        } else {
            navigationWrappingWindow = thumbGalleryWindow;
        }
    
        createThumbGallery();
        
        Ti.Gesture.addEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
    
        thumbGalleryWindow.addEventListener('close', function() {
            Ti.Gesture.removeEventListener('orientationchange', reComputeImageGalleryOnOrientationChange);
            thumbGalleryWindow.dummy.close();
        });
        
        return navigationWrappingWindow;
    
    }};
})();
