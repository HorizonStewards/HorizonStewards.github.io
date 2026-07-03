const CONST_SPECIES      = 'species:';
const CONST_OBSERVATIONS = 'observations:';
const CONST_OF           = ' of ';

const LIFE_STAGE_MAP = {
  '2': 'adult',
  '3': 'teneral',
  '4': 'pupa',
  '5': 'nymph',
  '6': 'larva',
  '7': 'egg',
  '8': 'juvenile',
  '16': 'submiago'
};

function fcomnum(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',') }; 

function furl(url,txt=url) { return '<a href="'+url+'">'+txt+'</a>'; };
function faddelem(etype,eparent=null,eattributes={}) { 
   let eobj = document.createElement(etype);
   for (let [key,value] of Object.entries(eattributes)) {
      if ( typeof value === 'object' && value !== null ) {
         for (let [subkey,subvalue] of Object.entries(value)) { eobj[key][subkey] = subvalue; };
      }
      else { eobj[key] = value; };
    };
   if (eparent) { eparent.appendChild(eobj); };
   return eobj;
}

function faddelems(etype,eparent=null,eattributes=[]) { for (let e of eattributes) { faddelem(etype,eparent,e); }; };
function fpageurl(urlbase,urlparams,per_page,page) {
   let params = new URLSearchParams(urlparams);
   let url_per_page = params.get('per_page');
   let url_page = params.get('page');
   (url_per_page===null) ? params.append('per_page',per_page) : params.set('per_page',per_page);
   (url_page===null) ? params.append('page',page) : params.set('page',page);
   return urlbase+'?'+params;
}

function fpageurlplusorderbyid(urlbase,urlparams,per_page,page) {
   let params = new URLSearchParams(urlparams);
   params.get('order_by') ? params.set('order_by','id') : params.append('order_by','id');
   return fpageurl(urlbase,params,per_page,page);
}

function ffetch(url) {
   return fetch(url)
   .then((response) => {
      if (!response.ok) { throw new Error(response.status+': '+response.statusText); };
      return response.json();
   })
   .catch((err) => { console.error(err); });
}

function famp(str) { return str.replace(/&/g,'&amp;'); };
function fshorten(num) { return num<10000 ? num : num<1000000 ? (num/1000).toFixed(1)+'K' : (num/1000000).toFixed(1)+'M'; };
function fdate(str,dateonly=false) {
   str = str.replace(/t/i,' '); //replaces T (case insensitive) with a space
   if (dateonly) { str = str.split(' ')[0]; }
   else {
      str = str.replace(/([+-]\d{2}\:?\d{2})/,' ($1)'); //puts parenthesis around time zone offset
      str = str.replace(/z/i,' (+00:00)'); //replaces Z (case insensitve) with UTC
      str = str.replace('+00:00','±00:00');
   };
   return str;
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) {
    return str;
  } else {
     return (str.substring(0, maxLength) + '...');
  }
}

function isMultipleOfFour(num) {
  return num % 4 === 0;
}

function isMultipleOfThree(num) {
  return num % 3 === 0;
}

function replaceDoubleQuotes(str) {
  return str.replace(/"/g, '%22');
}

function capitalizeWords(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function boxRow(field_id, field_name, field_value) {
    this.field_id    = field_id;
    this.field_name  = field_name;
}

// functions for menu bar
function buildDD( name, content ) {
  let dd = '<div class="dropdown">' +
                 '<button class="dropbtn">' + name +
                    '<i class="fa fa-caret-down"></i>' +
                 '</button>' +
                    '<div class="dropdown-content">' +
                          content +
                    '</div>' +
           '</div>';

  return( dd );
}

function buildDDTitle( content ) {
  let dd = '<div class="dd_title">' + content +
           '</div>';

  return( dd );
}

function buildMenuURL( url ) {
  let dd = '<div id="menu_title">' + url +     
           '</div>';

  return( dd );
}

function buildHome( url ) {
   return ('<div id="home">'+url+'</div>');
}

function copyOpts( winurlparams ) {
   let opts='';
   // build param list for url's used in fresults
   for( const [key, value] of winurlparams.entries() ) { 
        if( opts === '' ){
            opts += "?";
        } else {
            opts += "&";
        }
        opts += key;
        opts += "=";

        if( key === 'page' ){
            opts += '1';
        } else {
            opts += value;
        }
   } 
   return( opts );
}

function removeItemFromCommaDelimitedList(listString, itemToRemove) {
  // 1. Split the string into an array
  const listArray = listString.split(',').map(item => item.trim()).filter(item => item !== '');

  // 2. Remove the desired item from the array
  const updatedArray = listArray.filter(item => item !== itemToRemove);

  // 3. Join the array back into a comma-delimited string
  const updatedListString = updatedArray.join(',');

  return updatedListString;
}

function buildNavDDFilteredShow( navbar, dd_name, results, config, baseUrl ) {

    // Get the raw string from the URL
    let raw_taxon_str = getTaxonDD(appState) || ""; 
    
    // CLEANER: Split by comma and keep ONLY items that are in your config.json
    // This deletes anything injected into the dd url param by the user.
    let sub_taxon_arr = raw_taxon_str.split(',').filter(id => {
        return config.subIcons.some(iconObj => iconObj.taxonId.toString() === id.trim());
    });

    // Force the appState to only have the clean IDs
    appState = setTaxonDD(appState, sub_taxon_arr.join(','));
 
    sub_taxon_arr = getTaxonDD(appState) || [];
 
    if( getTaxonDD(appState) ) {
        sub_taxon_arr = getTaxonDD(appState);
    } else {
        if( config.subIcons ) {
            for( let i=0; i<results.length; i++) {
                 if( !sub_taxon_arr.includes(results[i].taxon.id.toString()) ) {
                     for( let j=0; j<config.subIcons.length; j++ ) {
                          for( let k=0; k<results[i].taxon.ancestor_ids.length; k++ ) {
                               if( results[i].taxon.ancestor_ids[k].toString() === config.subIcons[j].taxonId.toString() ){
                                   if( !sub_taxon_arr.includes( config.subIcons[j].taxonId ) ) {
                                       sub_taxon_arr.push( config.subIcons[j].taxonId );
                                   }
                               }
                           }
                      }
                 }
             }
             // add the comma delimited list of taxons to the url params
             // so the full list can still be shown during filtration.
             appState = setTaxonDD(appState, sub_taxon_arr.join());
        }
    } 

    buildNavDDShow( navbar, dd_name, results, config, baseUrl, sub_taxon_arr );
}

function buildNavDDShow( navbar, dd_name, results, config, baseUrl, sub_taxon_arr ) {

    // Build the Show Dropdown
    if( config.subIcons ) {
        let urlState = appState;
        urlState = setMenuId(urlState, '');
        urlState = setMenuName(urlState, '');
        urlState = setActivityFilter(urlState, '');  // only show the other filters drop-down if they haven't chosen from menu
        urlState = setPage(urlState, '1');

        // Create the Dropdown container
        let dropdown = faddelem('div', navbar, { className: 'dropdown' });
       
        // Dropdown Button
        faddelem('button', dropdown, { 
            className: 'dropbtn', 
            textContent: capitalizeWords(dd_name) 
        });

        // Dropdown Content (the links)
        let ddContent = faddelem('div', dropdown, { className: 'dropdown-content' }); 

        // ALL Link
        let allUrl = baseUrl + buildParameterList(urlState);
        let allLink = faddelem('a', ddContent, { href: allUrl });
        // Icon for ALL
        faddelem('span', allLink, { innerHTML: CONST_PLUS_UTF8 });
        // Text for ALL 
        faddelem('span', allLink, { textContent: CONST_ALL }); 

        // Taxon Links Loop
        for( let j = 0; j < config.subIcons.length; j++ ) {
             // there will be no sub_taxon_arr if we aren't filtering
             // if sub_taxon_arr is null build the show link since we aren't filtering
             // if we ARE filtering, make sure the filtered array includes the taxonId from the config
             if( !sub_taxon_arr || sub_taxon_arr.includes(config.subIcons[j].taxonId) ) {
                 urlState = setMenuId(urlState, config.subIcons[j].taxonId);
                 let iconUrl = baseUrl + buildParameterList(urlState);
                 
                 let tLink = faddelem('a', ddContent, { href: iconUrl });

                 // Taxon Icon if present
                 if( config.subIcons[j].icon ) {
                     faddelem('span', tLink, { innerHTML: config.subIcons[j].icon });
                 }
             
                 // Taxon Name 
                 faddelem('span', tLink, { textContent: config.subIcons[j].name });
             }
        }
    }
}

function buildHeader(entity, total, per_page, page_curr, page_max, title_1, title_2, title_3) {
    const container = document.createElement('div');
    container.className = 'rl-box-bar';

    // Left Side Box
    const lboxDiv = document.createElement('div');
    lboxDiv.id = 'lbox';
    const tableLeft = document.createElement('table');
    tableLeft.className = 'tableboxkey';

    let x_of_y = page_curr + CONST_OF + page_max;

    const rows = [
        [entity, total],
        ['per page:', per_page],
        ['page:', x_of_y]
    ];

    rows.forEach(([label, val]) => {
        const tr = document.createElement('tr');
        tr.className = 'trboxes';
        
        const tdL = document.createElement('td');
        tdL.className = 'tdleft';
        tdL.textContent = label; // Safe from injection
        
        const tdR = document.createElement('td');
        tdR.className = 'tdrightbox';
        tdR.textContent = val;   // Safe from injection
        
        tr.append(tdL, tdR);
        tableLeft.appendChild(tr);
    });
    lboxDiv.appendChild(tableLeft);

    // Right Side: Titles (Always 3 rows)
    const rightDiv = document.createElement('div');
    rightDiv.id = 'upperright';
    const tableRight = document.createElement('table');
    tableRight.className = 'tableboxkey';

    // We iterate through all three, even if title_1 or title_2 are null
    [title_1, title_2, title_3].forEach((content) => {
        const tr = document.createElement('tr');
        tr.className = 'trboxes';
        const td = document.createElement('td');
        td.className = 'tdrightbox2';

        if (!content || content === '') {
            // Use a non-breaking space to maintain row height
            td.innerHTML = '&nbsp;'; 
        } else if (typeof content === 'string') {
            // If it looks like HTML (contains < >), use innerHTML
            // Otherwise, use textContent for maximum security
            if (content.includes('<') && content.includes('>')) {
                td.innerHTML = content; 
            } else {
                td.textContent = content;
            }
        } else if (content instanceof HTMLElement) {
            // If it's already a DOM element object
            td.appendChild(content);
        }

        tr.appendChild(td);
        tableRight.appendChild(tr);
    });
    rightDiv.appendChild(tableRight);

    container.append(lboxDiv, rightDiv);
    return container;
}
