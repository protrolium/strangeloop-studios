// /recent horizontal scroll
const recent = document.getElementById("recentContainer");
let distance = null;

if (recent != null) {
    let distance = recent.clientWidth;
    console.log(distance);

    function leftScroll() {
        recent.scrollBy({
            left: -distance,
            behavior: 'smooth'
        });
    }

    function rightScroll() {
        recent.scrollBy({
            left: distance,
            behavior: 'smooth'
        });
    }
}

// display the Los Angeles CA local time in 24H time and update it every second
function displayTime() {
    var time = document.getElementById('studio-time');
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds;
    time.innerHTML = strTime;
    setTimeout(displayTime, 1000);
}

//only display the time if the element exists on the page
if (document.getElementById('studio-time')) {
    displayTime();
}

// display SearchEngine results dynamically with AJAX
const searchForm = document.getElementById('se-form')
if (searchForm) {
    
	const searchInput = searchForm.querySelector('input[name="q"]')
	const searchCache = {}

	let searchTimeout
	let searchResults

	const findResults = () => {
		window.clearTimeout(searchTimeout)
		searchTimeout = window.setTimeout(() => {
			if (searchResults) {
				searchResults.setAttribute('hidden', 'true')
			}
			if (searchInput.value.length > 2) {
				if (searchCache[searchInput.value]) {
					renderResults(searchForm, searchCache[searchInput.value])
					return
				}
				if (searchInput.hasAttribute('data-request')) {
					return
				}
				searchInput.setAttribute('data-request', 'true')
				searchInput.setAttribute('disabled', 'true')
				const searchParams = new URLSearchParams()
				searchParams.append('q', searchInput.value)
				fetch(`${pwConfig.rootUrl}search/?${searchParams}`, {
					headers: {
						// set the request header to indicate to ProcessWire that this is an AJAX request; this
						// way we can check $config->ajax in the template file and return JSON instead of HTML
						// by calling $modules->get('SearchEngine')->renderResultsJSON()
						'X-Requested-With': 'XMLHttpRequest',
					},
				})
					.then((response) => {
						if (!response.ok) {
							throw new Error('Network response was not ok')
						}
						return response.json()
					})
					.then((data) => {
						searchCache[searchInput.value] = data
						renderResults(searchForm, data)
						searchInput.removeAttribute('data-request')
						searchInput.removeAttribute('disabled')
						searchInput.focus()
					})
					.catch((error) => {
						console.error('Error fetching search results:', error)
						searchInput.removeAttribute('data-request')
						searchInput.removeAttribute('disabled')
						searchInput.focus()
					})
			}
		}, 300)
	}

	const maybeHideResults = () => {
		if (searchResults) {
			window.setTimeout(() => {
				if (!searchResults.querySelector(':focus')) {
					searchResults.setAttribute('hidden', 'true')
				}
			}, 100)
		}
	}

	const hideResults = () => {
    if (searchResults) {
      searchResults.setAttribute('hidden', 'true');
    }
  }
  
  // Helper function to decode HTML entities safely
  const decodeHtmlEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const renderResults = (form, data) => {
    // Check if results container exists, create it if not
    searchResults = document.getElementById('se-results');
    if (!searchResults) {
      searchResults = document.createElement('div');
      searchResults.id = 'se-results';
      searchResults.addEventListener('focusout', maybeHideResults);
      form.insertAdjacentElement('afterend', searchResults);
    }
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h2');
    heading.className = 'search-results__heading';
    heading.textContent = 'Search results';
    searchResults.appendChild(heading);
    
    if (data.results.length > 0) {
      // Create summary paragraph
      const summary = document.createElement('p');
      summary.className = 'search-results__summary';
      summary.id = 'se-results-summary';
      summary.textContent = `${data.results.length} results for "${decodeHtmlEntities(data.query)}":`;
      searchResults.appendChild(summary);
      
      // Create results list
      const resultsList = document.createElement('ul');
      resultsList.className = 'search-results__list';
      resultsList.setAttribute('aria-labelledby', 'se-results-summary');
      
      // Add each result to the list
      data.results.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.className = 'search-results__list-item';
        
        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.className = 'search-result';
        
        // Create link
        const link = document.createElement('a');
        link.className = 'search-result__link';
        link.href = item.url;
        link.textContent = decodeHtmlEntities(item.title);
        resultContainer.appendChild(link);
        
        // Create path display
        const path = document.createElement('div');
        path.className = 'search-result__path';
        path.textContent = item.url;
        resultContainer.appendChild(path);
        
        // Add result to list item
        listItem.appendChild(resultContainer);
        resultsList.appendChild(listItem);
      });
      
      // Add results list to container
      searchResults.appendChild(resultsList);
      searchResults.removeAttribute('hidden');
    } else {
      // No results found
      const summary = document.createElement('p');
      summary.className = 'search-results__summary';
      summary.textContent = `No results found for "${decodeHtmlEntities(data.query)}"`;
      searchResults.appendChild(summary);
      searchResults.removeAttribute('hidden');
    }
  }

	searchInput.addEventListener('keyup', findResults)

	searchInput.addEventListener('focus', (event) => {
		if (searchInput.value.length > 2) {
			findResults(event)
		}
	})

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			hideResults(event)
		}
	})
}

// Find and disable the submit button within the form
const submitButton = searchForm.querySelector('input[type="submit"]') || 
                     searchForm.querySelector('button[type="submit"]');
if (submitButton) {
  submitButton.disabled = true;
}

// clearing the search field input field means clearing the se-results markup
const searchInput = document.querySelector('input[name="q"]');
if (searchInput) {
  // Add an event listener for the input event
  searchInput.addEventListener('input', function() {
    // If the input is empty, hide the results
    if (this.value === '') {
      // Find the search results container
      const resultsContainer = document.getElementById('se-results');
      if (resultsContainer) {
        resultsContainer.setAttribute('hidden', 'true');
      }
    }
  });
}

/////////
////////
//////

document.addEventListener("DOMContentLoaded", function() {
    var lazyloadImages;    
  
    if ("IntersectionObserver" in window) {
      lazyloadImages = document.querySelectorAll(".lazyLoad");
      var imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var image = entry.target;
            image.classList.remove("lazyLoad");
            imageObserver.unobserve(image);
          }
        });
      });
  
      lazyloadImages.forEach(function(image) {
        imageObserver.observe(image);
      });
    } else {  
      var lazyloadThrottleTimeout;
      lazyloadImages = document.querySelectorAll(".lazyLoad");
      
      function lazyload () {
        if(lazyloadThrottleTimeout) {
          clearTimeout(lazyloadThrottleTimeout);
        }    
  
        lazyloadThrottleTimeout = setTimeout(function() {
          var scrollTop = window.pageYOffset;
          lazyloadImages.forEach(function(img) {
              if(img.offsetTop < (window.innerHeight + scrollTop)) {
                img.src = img.dataset.src;
                img.classList.remove('lazyLoad');
              }
          });
          if(lazyloadImages.length == 0) { 
            document.removeEventListener("scroll", lazyload);
            window.removeEventListener("resize", lazyload);
            window.removeEventListener("orientationChange", lazyload);
          }
        }, 20);
      }
  
      document.addEventListener("scroll", lazyload);
      window.addEventListener("resize", lazyload);
      window.addEventListener("orientationChange", lazyload);
    }

    const div = document.getElementById('se-results');
    
    // Hide search results when clicking outside the search form and results
    document.addEventListener('click', (event) => {
        const searchForm = document.getElementById('se-form');
        const searchResults = document.getElementById('se-results');
        const searchInput = document.querySelector('input[name="q"]');
        
        // Check if the click is outside both the search form and results container
        if (searchForm && searchResults && 
            !searchForm.contains(event.target) && 
            !searchResults.contains(event.target)) {
            if (searchResults && !searchResults.hasAttribute('hidden')) {
                searchResults.setAttribute('hidden', 'true');
                // Clear the search input field
                if (searchInput) {
                    searchInput.value = '';
                }
            }
        }
    });
    
    if (div) {
      div.addEventListener('click', function() {
        this.classList.add('hidden');
      });
    }
  });


  