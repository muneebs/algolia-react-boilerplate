// ------------------------------------------
// Carousel Config
// ------------------------------------------

// ------------------------------------------
// The attribute is used as the filter to retreive the results for each carousel
// The attribute uses filter syntax https://www.algolia.com/doc/api-reference/api-parameters/filters/
// The title is used to show above each carousel to indicate what it shows
// ------------------------------------------
//If you use translation please write your title in different language and respect the
// title+language combination

export const carouselConfig = [
  {
    context: 'homepage-carousel-one',
    titleEn: 'Our Bags Collection',
    titleFr: 'Notre Collection de sacs',
  },
  {
    context: 'homepage-carousel-two',
    titleEn: 'Our Best Hoodies',
    titleFr: 'Nos meilleurs sweats',
  },
];

// Indicates how many records should be shown in an individual carousel
export const hitsPerCarousel = 8;
