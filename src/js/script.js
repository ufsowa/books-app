'use strict';

/**** App settings ****/

const select = {
  templateOf: {book: '#template-book'},
  containerOf: {collection: '.books-panel > .books-list'},
  book: {
    image: '.book__image',
    rating: '.book__rating__fill'
  },
  controlPanel: {filters: '.filters'},
};

const classNames = {
  book: {
    favorite: 'favorite',
    imgWrapper: 'book__image',
    hidden: 'hidden'
  },
};

const templates = {
  book: Handlebars.compile(document.querySelector(select.templateOf.book).innerHTML),
};


class Book {
  constructor(data){
    const thisBook = this;

    thisBook.dom = {};
    thisBook.data = data;
    thisBook.id = data.id;
    thisBook.hidden = false;

    thisBook.render(data);
    thisBook.initElements();
    thisBook.initActions();
    thisBook.setRating();
  }

  render(data) {
    const thisBook = this;

    const collectionElement = app.collection.dom.element;

    const htmlElement = templates.book(data);
    thisBook.dom.element = utils.createDOMFromHTML(htmlElement);

    collectionElement.appendChild(thisBook.dom.element);
  }

  initElements() {
    const thisBook = this;

    thisBook.dom.image = thisBook.dom.element.querySelector(select.book.image);
    thisBook.dom.rating = thisBook.dom.element.querySelector(select.book.rating);
  }

  initActions() {
  }

  applyFilters(filters) {
    const thisBook = this;
    thisBook.hidden = false;

    const bookParams = thisBook.data.details;

    for (let filter of filters) {
      const isFilterAllowed = bookParams[filter];
      if(!isFilterAllowed) {
        thisBook.hidden = true;
        break;
      }
    }

    //  apply filter to image
    if (thisBook.hidden) {
      thisBook.dom.image.classList.add(classNames.book.hidden);
    } else {
      thisBook.dom.image.classList.remove(classNames.book.hidden);
    }
  }

  setRating() {
    const thisBook = this;

    const ratingPercentage = Math.round(thisBook.data.rating * 10.0);
    const width = ratingPercentage + '%';
    let background = '';

    if(ratingPercentage < 60) {
      background = 'linear-gradient(to bottom,  #fefcea 0%, #f1da36 100%)';
    }
    else if(ratingPercentage <= 80) {
      background = 'linear-gradient(to bottom, #b4df5b 0%,#b4df5b 100%)';
    }
    else if(ratingPercentage <= 90) {
      background = 'linear-gradient(to bottom, #299a0b 0%, #299a0b 100%)';
    }
    else if(ratingPercentage > 90) {
      background = 'linear-gradient(to bottom, #ff0084 0%,#ff0084 100%)';
    } else {
      background = '';
    }
    // set rating style
    thisBook.dom.rating.style.width = width;
    thisBook.dom.rating.style.background = background;
  }

  getItem() {
    const thisBook = this;

    const bookItem = {
      id: thisBook.id,
      name: thisBook.data.name,
      price: thisBook.data.price,
      rating: thisBook.data.rating,
    };

    return bookItem;
  }
  
}

class Collection {
  constructor(data){
    const thisCollection = this;
    
    thisCollection.initData(data);
    thisCollection.getElements();
    thisCollection.initActions();
  }

  initData() {
    const thisCollection = this;

    thisCollection.dom = {};
    thisCollection.books = {};
    thisCollection.booksToOrder = {};
    thisCollection.favoriteBooks = [];
  }

  getElements() {
    const thisCollection = this;

    thisCollection.dom.element = document.querySelector(select.containerOf.collection);
  }

  initActions(){
    const thisCollection = this;

    thisCollection.dom.element.addEventListener('dblclick', function(event) {
      event.preventDefault();
      thisCollection.toggleFavorite(event.target.offsetParent);         
    });

  }

  renderBooks(data) {
    const thisCollection = this;

    for (let bookData of data.books) {
      const bookItem = new Book(bookData);
      thisCollection.books[bookItem.id] = bookItem;
      thisCollection.booksToOrder[bookItem.id] = bookItem.getItem();
    } 
  }

  toggleFavorite(clickedBookEle) {
    const thisCollection = this;

    if(!clickedBookEle.classList.contains(classNames.book.imgWrapper)) return;

    const bookId = parseInt(clickedBookEle.getAttribute('data-id'));
    const favoriteBookIndex = thisCollection.favoriteBooks.indexOf(bookId);

    if (favoriteBookIndex >= 0) {
      thisCollection.favoriteBooks.splice(favoriteBookIndex, 1);
      clickedBookEle.classList.remove(classNames.book.favorite);
    } else {
      thisCollection.favoriteBooks.push(bookId);
      clickedBookEle.classList.add(classNames.book.favorite);
    } 
  }

  filterBooks(filters) {
    const thisCollection = this;

    for (let book of Object.values(thisCollection.books)) {
      book.applyFilters(filters);
    }
  }
}

class ControlPanel {
  constructor() {
    const thisPanel = this;

    thisPanel.dom ={};
    thisPanel.filters = [];

    thisPanel.initElements();
    thisPanel.initActions();
  }

  initElements() {
    const thisPanel = this;

    thisPanel.dom.element = document.querySelector(select.controlPanel.filters);
  }

  initActions(){
    const thisPanel = this;

    thisPanel.dom.element.addEventListener('click', function(event) {
      thisPanel.updateControls(event.target);
    });
  }

  updateControls(clickedElement) {
    const thisPanel = this;

    if (clickedElement.tagName === 'INPUT' &&
    clickedElement.type === 'checkbox' &&
    clickedElement.name === 'filter' ) {
      const filterName = clickedElement.value;
      const selectedFilterIndex = thisPanel.filters.indexOf(filterName);

      if (clickedElement.checked && !(selectedFilterIndex >= 0)) {
        thisPanel.filters.push(clickedElement.value);
      } else {
        thisPanel.filters.splice(selectedFilterIndex, 1);
      }
      app.collection.filterBooks(thisPanel.filters);
    }
  }
}

const app = {

  init: function() {
    const thisApp = this;
    console.log('*** Init app ***');
    console.log(thisApp); 

    thisApp.initData();
    thisApp.initCollection();
    thisApp.initControlPanel();

    thisApp.collection.renderBooks(thisApp.data);
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = dataSource;
  },

  initCollection: function() {
    const thisApp = this;

    const collection = new Collection(thisApp.data);

    thisApp.collection = collection;
  },

  initControlPanel: function() {
    const thisApp = this;

    thisApp.controlPanel = new ControlPanel();
  }
};




/**** Main app ****/
app.init();