import axios from 'axios';
import { mainUrl, selection } from './api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const galleryItems = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';

const lightbox = () =>
  new SimpleLightbox('.photo-card a', {
    captionsData: 'alt',
    captionDelay: 250,
  });

function getPhotos(hits) {
  const markup = hits
    .map(item => {
      return `
       <div class="photo-card">
          <a href="${item.largeImageURL}"> 
            <img src="${item.webformatURL}" alt="${item.tags}" />
          </a>
          <div class="info">
            <p class="info-item">
              <p> <b> Likes </b> </br> ${item.likes}</p>
            </p>
            <p class="info-item">
              <p> <b>Views</b> </br> ${item.views}</p>
            </p>
            <p class="info-item">
              <p> <b> Comments</b></br>${item.comments}</p>
            </p>
            <p class="info-item">
              <p> <b> Downloads</b></br>${item.downloads}</p>
            </p>
          </div>
        </div>`;
    })
    .join('');
  galleryItems.insertAdjacentHTML('beforeend', markup);
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.target;
  selection.params.q = form.elements.searchQuery.value;
  if (selection.params.q === '') {
    Notify.info('Fill in the search input!');
    galleryItems.innerHTML = '';
    return;
  }

  selection.params.page = 1;
  galleryItems.innerHTML = '';

  try {
    const response = await axios.get(mainUrl, selection);
    const totalHits = response.data.totalHits;
    const hits = response.data.hits;
    if (hits.length === 0) {
      loadMoreBtn.style.display = 'none';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      getPhotos(hits);
      lightbox();
      loadMoreBtn.style.display = 'block';
    }
  } catch (err) {
    console.log(err);
  }
}

async function getMorePhotos() {
  selection.params.page += 1;
  try {
    const response = await axios.get(mainUrl, selection);
    const hits = response.data.hits;
    const totalHits = response.data.totalHits;
    getPhotos(hits);
    if (selection.params.page * selection.params.per_page >= totalHits) {
      loadMoreBtn.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (err) {
    console.log(err);
  }
}

searchForm.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', getMorePhotos);