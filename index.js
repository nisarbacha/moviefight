const debounce = (fun, delay = 1000) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fun.apply(null, args);
    }, delay)
  }
}


const createAutoComplete = ({ root, renderOption, onOptionSelect, inputValue, fetchData }) => {
  root.innerHTML = `
                    <label><b>Search</b></label>
                    <input class="input" />
                    <div class="dropdown">
                        <div class="dropdown-menu">
                        <div class="dropdown-content results"></div>
                        </div>
                    </div>
                    `;

  const input = root.querySelector('input');
  const dropdown = root.querySelector('.dropdown');
  const resultsWrapper = root.querySelector('.results');

  const onInput = async event => {
    const items = await fetchData(event.target.value);
    if (!items.length) {
      dropdown.classList.remove('is-active');
      return;
    }
    resultsWrapper.innerHTML = '';
    dropdown.classList.add('is-active');
    for (let item of items) {

      const option = document.createElement('a');
      option.classList.add('dropdown-item')
      option.innerHTML = renderOption(item);
      option.addEventListener('click', () => {
        dropdown.classList.remove('is-active');
        input.value = inputValue(item)
        onOptionSelect(item);
      })
      resultsWrapper.appendChild(option);
    }
  };
  input.addEventListener('input', debounce(onInput, 500));
  document.addEventListener('click', event => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  })
} 
 
 const autCompleteConfig = {
   renderOption(movie) {
     const imgSrc = movie.Poster === "N/A" ? '' : movie.Poster;
     return `
       <img src="${imgSrc}"/>
       ${movie.Title} (${movie.Year})
       `;
   },
   
   inputValue(movie) {
     return movie.Title;
   },
   async fetchData(searchTerm) {
     const response = await axios.get('https://www.omdbapi.com/', {
       params: {
         apikey: '3f3c6873',
         s: searchTerm
       }
     });
     if (response.data.Error) {
       return [];
     }
     return response.data.Search;
   }
 }
createAutoComplete({
  ...autCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },

});
createAutoComplete({
  ...autCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },

})
let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('https://www.omdbapi.com/', {
    params: {
      apikey: '3f3c6873',
      i: movie.imdbID
    }
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  if(side === 'left'){
    leftMovie = response.data;
  }
  else{
    rightMovie = response.data;
  }
  if(leftMovie && rightMovie){
    runComparison();
  }
};
const runComparison = () => {
   const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStates = document.querySelectorAll('#right-summary .notification');
    leftSideStats.forEach((leftStat, index) =>{
    const rightStat = rightSideStates[index];
      const leftSideValue = parseInt(leftStat.dataset.value);
      const rightSideValue = parseInt(rightStat.dataset.value);
      if (rightSideValue > leftSideValue){
        leftStat.classList.remove('is-primary');
        leftStat.classList.add('is-warning');
      } else {
        rightStat.classList.remove('is-primary');
        rightStat.classList.add('is-warning');
      } 
    })
}
const movieTemplate = (movieDetails) => {
  const { Poster, Title, Genre, Plot, Awards, BoxOffice, Metascore, imdbRating, imdbVotes } = movieDetails;
  const awards = Awards.split('').reduce((prev, word)=>{
    const value = parseInt(word);
    if(isNaN(value)){return prev;}
    else{return prev + value}
  }, 0)
  const dollars = parseInt(BoxOffice.replace(/\$/g,'').replace(/,/g, ''));
  const metascore = parseInt(Metascore);
  const imdbrating = parseFloat(imdbRating);
  const imdbvotes = parseInt(imdbVotes.replace(/,/g, '')); 
  return `
          <article class='media'>
              <figure class='media-left'>
                <p class='image'>
                  <img src='${Poster}'/>
                </p>
              </figure>
            <div class='media-content'>
              <div class='content'>
                <h1>${Title}</h1>
                <h4>${Genre}</h4>
                <p>  ${Plot} </p>
              </div>
            </div>
          </article>
          <article data-value=${awards} class='notification is-primary'>
              <p class='title'>${Awards}</p> 
                <p class='subtitle'>Award</p>
          </article>
           <article data-value=${dollars}  class='notification is-primary'>
              <p class='title'>${BoxOffice}</p>
                <p class='subtitle'>BoxOffice</p>
          </article>
           <article data-value=${metascore}  class='notification is-primary'>
              <p class='title'>${Metascore}</p>
                <p class='subtitle'>Metascore</p>
          </article>
           <article data-value=${imdbrating}  class='notification is-primary'>
              <p class='title'>${imdbRating}</p>
                <p class='subtitle'>imdbRating</p>
          </article>
  <article data-value=${imdbvotes} class='notification is-primary'>
              <p class='title'>${imdbVotes}</p>
                <p class='subtitle'>imdbVotes</p>
          </article>
  `
}


