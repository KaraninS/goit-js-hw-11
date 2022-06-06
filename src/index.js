import './css/styles.css'
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const axios = require('axios');
import Notiflix from 'notiflix';
import OnlyScroll from 'only-scrollbar';

const API_KEY = '27862087-edc264b2265208386e6abd16d';
const URL = "https://pixabay.com/api/";

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const input = document.querySelector('input')

const lightbox = new SimpleLightbox('.gallery a', {
    showCounter: false,
    enableKeyboard: true,
    close: true,
});
   
const scroll = new OnlyScroll(document.scrollingElement, {
    damping: 0.8,
    eventContainer: window
});

let pageforBtn = 1;
let totalHitsValue = '';
let value = '';

searchForm.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', loadMoreClk)

function onSubmit(event) {
    event.preventDefault();
    gallery.innerHTML = '';
    value = event.currentTarget.elements.searchQuery.value.trim();
    if (!value) {
        Notiflix.Notify.failure('There is nothing to find', {
      clickToClose: true,
    });
        loadMoreBtn.classList.add('is-hidden');
        return;
    }

    else {
        pageforBtn = 1;

        getUser(value).then(() => {
            if (totalHitsValue > 0) {
                Notiflix.Notify.success(`Hooray! We found ${totalHitsValue} images.`)
            }
            pageforBtn += 1;
            lightbox.refresh();
            input.value = "";
        });
    }
}


async function getUser(q) {
    try {
        const response = await axios.get(`${URL}?key=${API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageforBtn}`)

        let arr = response.data;
        let lastPage = Math.ceil(arr.totalHits / 40);
        totalHitsValue = arr.totalHits;
        
        renderGallery(arr.hits);

        if (arr.hits.length === 0) {
            loadMoreBtn.classList.add('is-hidden');
            return Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.", {
                clickToClose: true,
                timeout: 5000,
            });
        }
        if (arr.total > 40) {
            loadMoreBtn.classList.remove('is-hidden');
        }
        if (pageforBtn === lastPage) {
            if (!loadMoreBtn.classList.contains('is-hidden')) {
                loadMoreBtn.classList.add('is-hidden')
            }
            if (arr.total <= 40) {
                return
            }
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    }
    catch (error) {
    console.log(error);
    }
};

function renderGallery(hits) {
    const photoCard = hits.map(
            ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
                `<div class="photo-card">
          <a class="photo-card__item" href="${largeImageURL}">
            <img class="photo-card__image" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
              <div class="info">
                <p class="info-item">
                  <b>Likes</b><br>
                  ${likes}
                </p>
                <p class="info-item">
                  <b>Views</b><br>
                  ${views}
                </p>
                <p class="info-item">
                  <b>Comments</b><br>
                  ${comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b><br>
                  ${downloads}
                </p>
              </div>
        </div>`,
        )
        .join('');

    gallery.insertAdjacentHTML('beforeend', photoCard);
}

function loadMoreClk (event){
    event.preventDefault();
  getUser(value)
    .then(() => {
        pageforBtn += 1;
        lightbox.refresh();

        const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
  }
  )
}
