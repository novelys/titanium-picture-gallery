# Pure Javascript Picture Gallery for Titanium

## Description

This pure javascript picture gallery provides you with a ready-to-use gallery, made of two components. A gallery of thumbnails, in which the user can quickly check pictures and a scrollable gallery of pictures, opened when the user touch one of the thumbnails. It works on both iOS and Android.

This javascript library is still in beta. Feel free to report any issues, fork it, pull some request or make it fit your own needs!

## Use the library

It is as simple as copy the javascript file along with the `images/` directory somewhere in your project and ~~include the javascript file~~ require the CommonJS module:

```javascript
var pictureGallery = require('picturegallery');
```
  
~~Once included, the file will create a new namespace, named `PictureGallery`.~~

## Usage

Here is a minimal example :

```javascript
var pictureGallery = require('picturegallery');

var images = [{
  path:'pathe/to/image', // /!\ To be changed
}];

var galleryWindow = pictureGallery.createWindow({
  images: images,
  title: 'Holiday pictures'
});

galleryWindow.open();
```
  
This will create a ready-to-use gallery, using built-in default values.

`createWindow` returns a Titanium Window. We plan to include another function which will return a view, usable in other windows.

### Setting images

The `images` property takes an array of dictionaries. Each dictionary contains three properties, with `path` being the only one mandatory.
`caption` obviously holds the caption while the `thumbPath` property holds the optional thumbnail image. If `thumbPath` is missing, the library will stretch down the image given by `path`.

```javascript
var images = [{
  path:'images/images1.jpg',
  thumbPath:'images/image1_thumb.jpg',
  caption: 'My beautiful picture!'
}, {
  path:'images/images2.jpg',
  thumbPath:'images/image2_thumb.jpg',
  caption: 'My other beautiful picture!'
}];

var pictureGallery = PictureGallery.createWindow({
  images: images
});
```

### The thumbnail gallery

You can custom the thumbnail gallery by passing a dictionary to the `thumbGallery` property. This dictionary supports the following properties:

* `numberOfColumn` **Number** generic number of column, will be overwrited by the two properties below. Use this property to quickly set the same number of columns for both orientations;

* `numberOfColumnPortrait` **Number** number of column in portrait mode, overwrites `numberOfColumn` if specified;
* `numberOfColumnLandscape` **Number** number of column in landscape mode, overwrites `numberOfColumn` if specified;

* `forceRealPixelSize` **Number** forces the `thumbSize` property to be read as a true pixel value rather than a density pixel value (false by default);

* `thumbSize` **Number** size of the thumbnail, will be used for the width and the height of the thumb;
* `thumbPadding` **Number** the padding between two thumbnails (density pixel), will be ignored if `thumbSize` is set;
* `thumbBorderColor` **String** border color of thumbnails;
* `thumbBorderWidth` **Number** border width of thumbnails;
* `thumbBorderRadius` **Number** border radius of thumbnails;
* `thumbBackgroundColor` **String** background color of thumbnails;

* `backgroundColor` **String** background color for the thumbnail gallery

You should be aware of this extreme case: let's imagine you set the `thumbSize` to 100, the `thumbPadding` to 80 and `numberOfColumn` to 5 on a screen that is only 320 pixels of width. You would overflow the screen. The library will then try to reduce as much as possible the padding to fit the thumbnail gallery inside the screen. If it is still to large, it will try to scale the thumbnails themselves. Normally, the gallery will always be inside the screen boundaries.

Example:

```javascript
var galleryWindow = pictureGallery.createWindow({
  images: images,
  title: 'Holiday pictures',
  
  thumbGallery: {
    numberOfColumnPortrait: 4,
    numberOfColumnLandscape: 5,
    thumbSize: 120,
    thumbBorderColor: '#555',
    thumbBorderWidth: 1,
    thumbBackgroundColor: '#FFF',
    backgroundColor: '#DDD'
  }
});
```

### The scrollable gallery

Each time you click on a thumbnail, you will open the scrollable gallery. The scrollable gallery works much like a native gallery, both on Android and iOS. You can scroll left to see the next picture and scroll right to see the last one. Alternatively, you can use arrows (if displayed) to slide from a picture to another.

A single tap will hide the user interface, to only let the picture visible.

You can custom as well the scrollable gallery by passing a dictionary to the `scrollableGallery` property. This dictionary supports the following properties:

* `labelColor` **String** color of the caption;
* `labelFont` **Dictionary** font used by the caption (similar to the font objects Titanium uses);
* `barColor` **String** (iPhone only) color of the navigation bar;

* `displayArrows` **Boolean** wether or not display left and right arrow for navigation (false by default);
* `displayCaption` **Boolean** wether or not display the caption;
* `i18nOfKey` **String** the key for translating the word 'of' into any language, like 'X of N', using Titanium built-in i18n mechanism.

Example:

```javascript
var pictureGallery = PictureGallery.createWindow({
  images: images,
  title: 'Holiday pictures',

  scrollableGallery: {
    labelColor: 4,
    labelFont: {fontSize : 18, fontWeight : 'bold'},
    barColor: '#000',
    displayArrows: true,
    displayCaption: true
  }
});
```

### One more little thing in practice

On iPhone, the library will create its own `NavigationGroup`, to display a navigation bar on the top. If you want to integrate the component with your own `NavigationGroup` or `TabGroup`, you can specify either the current tab or the navigation group to the `windowGroup` property.

On Android, the back button should work just fine. Be sure, however, to open the PictureGallery window as a heavyweight one.

```javascript
var pictureGallery = PictureGallery.createWindow({
  images: images,
  title: 'Holiday pictures',
  windowGroup: navigationGroup
});

if (Ti.platform.osname == 'android') {
  pictureGallery.open({navBarHidden: true})
} else if (Ti.platform.osname == 'iphone'){
  navigationGroup.open(pictureGallery)
}
```

## Authors

Pure Javascript Picture Gallery was made by [Frédéric Maquin](http://www.fredericmaquin.com) from [Novelys](http://www.novelys.com) (http://www.novelys.com). A small and agile software development team.

Feel free to contact us through our [website](http://www.novelys.com/contact) (http://www.novelys.com/contact)

Arrow icons are modified icons from the [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library).

## License

Licensed under the terms of the Apache Public License.

Please see the LICENSE included with this distribution for details.