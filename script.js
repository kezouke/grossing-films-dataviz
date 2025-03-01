/*******************************************************
 * GLOBAL VARIABLES & FETCH
 ******************************************************/
let allFilms = [];
let chartTop10, chartDirectors, chartOverTime, chartCountries;

// We'll create one global tooltip element for the table.
let tableTooltip = null;

fetch('films.json')
  .then(response => response.json())
  .then(data => {
    allFilms = data;

    // 1. Calculate & display top stats
    displayTopStats(allFilms);

    // 2. Render the four charts
    renderTop10Chart(allFilms);
    renderDirectorChart(allFilms);
    renderOverTimeChart(allFilms);
    renderCountryChart(allFilms);

    // 3. Build the interactive table
    buildFilmsTable(allFilms);

    // 4. Initialize search & sort controls
    initTableControls();

    // 5. Initialize the table tooltip
    initTableTooltip();
  })
  .catch(err => console.error("Error loading films.json:", err));


/*******************************************************
 * 1. DISPLAY TOP STATS
 ******************************************************/
function displayTopStats(films) {
  // Number of Films
  const filmCount = films.length;
  document.getElementById('filmCount').textContent = filmCount.toLocaleString();

  // Highest Single Film Gross
  if (films.length > 0) {
    const maxBoxOffice = Math.max(...films.map(f => f.box_office));
    document.getElementById('highestBoxOffice').textContent =
      `$${maxBoxOffice.toLocaleString()}`;
  } else {
    document.getElementById('highestBoxOffice').textContent = "$0";
  }

  // Total Box Office
  const totalBoxOffice = films.reduce((sum, f) => sum + (f.box_office || 0), 0);
  document.getElementById('totalBoxOffice').textContent =
    `$${totalBoxOffice.toLocaleString()}`;
}

/*******************************************************
 * 2. CHART RENDERING FUNCTIONS
 ******************************************************/

/**
 * Utility: Wrap long text to multiple lines at word boundaries
 * @param {string} text - the text to wrap
 * @param {number} maxLineChars - approx max characters per line
 * @returns {Array<string>} array of lines
 */
function wrapText(text, maxLineChars = 50) {
  if (!text) return [];
  const words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    // Check if adding this word exceeds the maxLineChars limit
    if ((currentLine + ' ' + word).length <= maxLineChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;  // start a new line
    }
  }
  // Push the last line if it exists
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/* ------------------------------------------
    CHART 1: Top 10 Highest-Grossing Films
   ------------------------------------------ */
function renderTop10Chart(films) {
  const sorted = [...films].sort((a, b) => b.box_office - a.box_office);
  const top10 = sorted.slice(0, 10);

  const ctx = document.getElementById('chartTop10').getContext('2d');
  if (chartTop10) chartTop10.destroy(); // destroy existing instance if re-rendering

  // Approx RGBA for #D4AF37
  const goldFill = 'rgba(212, 175, 55, 0.6)';
  const goldBorder = 'rgba(212, 175, 55, 1)';

  chartTop10 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(f => f.title),
      datasets: [{
        label: 'Box Office (USD)',
        data: top10.map(f => f.box_office),
        backgroundColor: goldFill,
        borderColor: goldBorder,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(212, 175, 55, 0.8)',
        hoverBorderColor: goldBorder,
        hoverBorderWidth: 2,
        hoverBorderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          onClick: null,  // no dataset toggling on legend click
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: function(context) {
              const film = top10[context.dataIndex];
              const boxOfficeStr = film.box_office.toLocaleString();
              // Always show Box Office as first line
              let lines = [`Box Office: $${boxOfficeStr}`];
              if (film.insight) {
                // Wrap the insight into multiple lines
                const wrappedInsight = wrapText(film.insight, 50);
                lines = lines.concat(wrappedInsight);
              }
              return lines;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      onClick: (evt, activeEls) => {
        if (activeEls.length > 0) {
          const idx = activeEls[0].index;
          const film = top10[idx];
          if (film.insight) {
            console.log(film.insight);
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ccc'
          },
          grid: {
            color: '#444'
          }
        },
        x: {
          ticks: {
            color: '#ccc'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/* ------------------------------------------
    CHART 2: Director Leaderboard (Total Box Office)
   ------------------------------------------ */
function renderDirectorChart(films) {
  // Accumulate box office by director
  const directorTotals = {};

  films.forEach(f => {
    // If multiple directors are comma-separated
    const directors = f.director.split(',');
    directors.forEach(d => {
      const name = d.trim();
      if (!directorTotals[name]) {
        directorTotals[name] = 0;
      }
      directorTotals[name] += f.box_office || 0;
    });
  });

  // Convert to array [director, totalGross], then sort desc
  const directorArr = Object.entries(directorTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // top 10

  const ctx = document.getElementById('chartDirectors').getContext('2d');
  if (chartDirectors) chartDirectors.destroy();

  // Approx RGBA for #D4AF37
  const goldFill = 'rgba(212, 175, 55, 0.6)';
  const goldBorder = 'rgba(212, 175, 55, 1)';

  chartDirectors = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: directorArr.map(item => item[0]),
      datasets: [{
        label: 'Total Box Office (USD)',
        data: directorArr.map(item => item[1]),
        backgroundColor: goldFill,
        borderColor: goldBorder,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(212, 175, 55, 0.8)',
        hoverBorderColor: goldBorder,
        hoverBorderWidth: 2,
        hoverBorderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          onClick: null,
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y.toLocaleString();
              return `Total Box Office: $${val}`;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ccc'
          },
          grid: {
            color: '#444'
          }
        },
        x: {
          ticks: {
            color: '#ccc'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/* ------------------------------------------
    CHART 3: Box Office Over Time (Line Chart)
   ------------------------------------------ */
function renderOverTimeChart(films) {
  // Group by year
  const byYear = {};
  films.forEach(f => {
    const yr = f.release_year;
    if (!yr) return;
    if (!byYear[yr]) byYear[yr] = 0;
    byYear[yr] += f.box_office || 0;
  });

  // Convert to array, sort by year ascending
  const yearArr = Object.keys(byYear)
    .map(year => ({
      year: parseInt(year),
      total: byYear[year]
    }))
    .filter(obj => !isNaN(obj.year))
    .sort((a, b) => a.year - b.year);

  const ctx = document.getElementById('chartOverTime').getContext('2d');
  if (chartOverTime) chartOverTime.destroy();

  // Approx RGBA for #D4AF37
  const goldLine = 'rgba(212, 175, 55, 1)';
  const goldFill = 'rgba(212, 175, 55, 0.2)';

  chartOverTime = new Chart(ctx, {
    type: 'line',
    data: {
      labels: yearArr.map(obj => obj.year),
      datasets: [{
        label: 'Total Box Office (USD)',
        data: yearArr.map(obj => obj.total),
        borderColor: goldLine,
        backgroundColor: goldFill,
        tension: 0.2,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          onClick: null,
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y.toLocaleString();
              return `Yearly Total: $${val}`;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: '#ccc'
          },
          grid: {
            color: '#444'
          }
        },
        x: {
          ticks: {
            color: '#ccc'
          },
          grid: {
            color: '#444'
          }
        }
      }
    }
  });
}

/* ------------------------------------------
    CHART 4: Country Distribution (Pie Chart)
   ------------------------------------------ */
function renderCountryChart(films) {
  // Tally films by country (1 count per film)
  const countryCounts = {};
  films.forEach(f => {
    const c = f.country || 'Unknown';
    if (!countryCounts[c]) countryCounts[c] = 0;
    countryCounts[c] += 1;
  });

  const countryArr = Object.entries(countryCounts);

  const ctx = document.getElementById('chartCountries').getContext('2d');
  if (chartCountries) chartCountries.destroy();

  // Use the distinct color palette
  const colorPalette = [
    'rgba(255,99,132,0.8)',
    'rgba(54,162,235,0.8)',
    'rgba(255,206,86,0.8)',
    'rgba(75,192,192,0.8)',
    'rgba(153,102,255,0.8)',
    'rgba(255,159,64,0.8)',
    'rgba(201,203,207,0.8)'
  ];

  // If there are more countries than palette colors, just repeat from the start
  const backgroundColors = countryArr.map((_, idx) =>
    colorPalette[idx % colorPalette.length]
  );

  chartCountries = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: countryArr.map(item => item[0]),
      datasets: [{
        label: '# of Films',
        data: countryArr.map(item => item[1]),
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          displayColors: false,
          callbacks: {
            label: function(context) {
              const label = context.label;
              const value = context.parsed;
              return `${label}: ${value} film(s)`;
            }
          }
        },
        legend: {
          labels: {
            color: '#ccc'
          }
        }
      }
    }
  });
}

/*******************************************************
 * 3. BUILD INTERACTIVE TABLE
 ******************************************************/
function buildFilmsTable(films) {
  const wrapper = document.getElementById('filmsTableWrapper');
  const tableHtml = createTableHtml(films);
  wrapper.innerHTML = tableHtml;

  // Attach row events for insights on hover
  attachRowEvents();
}

function createTableHtml(films) {
  let html = `
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Release Year</th>
          <th>Director(s)</th>
          <th>Box Office (USD)</th>
          <th>Country</th>
        </tr>
      </thead>
      <tbody>
  `;

  films.forEach(f => {
    const boxStr = f.box_office ? `$${f.box_office.toLocaleString()}` : '$0';
    // Store film.insight in data attributes
    html += `
      <tr data-title="${escapeHtml(f.title || '')}"
          data-insight="${escapeHtml(f.insight || '')}"
          data-box="${f.box_office ? f.box_office : 0}">
        <td>${escapeHtml(f.title)}</td>
        <td>${f.release_year || ''}</td>
        <td>${escapeHtml(f.director)}</td>
        <td>${boxStr}</td>
        <td>${escapeHtml(f.country || '')}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  return html;
}

function attachRowEvents() {
  const rows = document.querySelectorAll('#filmsTableWrapper table tbody tr');
  rows.forEach(row => {
    // Show tooltip on mouse enter
    row.addEventListener('mouseenter', (e) => {
      showRowTooltip(e, row);
    });
    // Hide tooltip on mouse leave
    row.addEventListener('mouseleave', () => {
      hideTableTooltip();
    });
  });
}

/*******************************************************
 * 4. TABLE CONTROLS: SEARCH & SORT
 ******************************************************/
function initTableControls() {
  // Search by title
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const term = searchBox.value.toLowerCase();
    const filtered = allFilms.filter(f => f.title.toLowerCase().includes(term));
    buildFilmsTable(filtered);
  });

  // Sort by release year
  const btnSortYear = document.getElementById('sortByYear');
  btnSortYear.addEventListener('click', () => {
    const sorted = [...allFilms].sort((a, b) => (a.release_year || 0) - (b.release_year || 0));
    buildFilmsTable(sorted);
  });

  // Sort by box office
  const btnSortBox = document.getElementById('sortByBoxOffice');
  btnSortBox.addEventListener('click', () => {
    const sorted = [...allFilms].sort((a, b) => (b.box_office || 0) - (a.box_office || 0));
    buildFilmsTable(sorted);
  });
}

/*******************************************************
 * 5. TABLE TOOLTIP (HOVER)
 ******************************************************/

/**
 * Creates a single tooltip element in the DOM for table usage.
 */
function initTableTooltip() {
  tableTooltip = document.createElement('div');
  tableTooltip.style.position = 'absolute';
  tableTooltip.style.visibility = 'hidden';
  tableTooltip.style.zIndex = '9999';
  // Example tooltip styling in a dark background with white text
  tableTooltip.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
  tableTooltip.style.color = '#fff';
  tableTooltip.style.padding = '8px 12px';
  tableTooltip.style.border = '1px solid #888';
  tableTooltip.style.borderRadius = '5px';
  tableTooltip.style.fontSize = '0.9rem';
  tableTooltip.style.maxWidth = '300px';
  tableTooltip.style.lineHeight = '1.4';
  tableTooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.6)';
  tableTooltip.style.whiteSpace = 'normal'; // preserve line breaks
  tableTooltip.style.pointerEvents = 'none'; // no direct interactions
  document.body.appendChild(tableTooltip);
}

function showRowTooltip(e, row) {
  const rowRect = row.getBoundingClientRect();
  const insight = row.getAttribute('data-insight');
  const box = parseInt(row.getAttribute('data-box'), 10);

  // If there's no insight, hide the tooltip
  if (!insight) {
    hideTableTooltip();
    return;
  }

  // Format the box office value
  const boxStr = box ? `$${box.toLocaleString()}` : '$0';

  // Build an HTML string:
  // - a small heading for “Box Office”
  // - a paragraph for the insight
  // You can style it however you like
  const tooltipHtml = `
    <p><strong>Box Office:</strong> ${escapeHtml(boxStr)}</p>
    <p>${escapeHtml(insight)}</p>
  `;

  // Use innerHTML so <p> tags display properly
  tableTooltip.innerHTML = tooltipHtml;
  tableTooltip.style.visibility = 'visible';

  // Position tooltip near the row (slightly below)
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const topPos = rowRect.bottom + scrollY + 5; // 5px offset below row
  const leftPos = rowRect.left + (rowRect.width / 2) - 150; // about half the tooltip's width
  tableTooltip.style.top = `${topPos}px`;
  tableTooltip.style.left = `${leftPos}px`;
}


function hideTableTooltip() {
  if (tableTooltip) {
    tableTooltip.style.visibility = 'hidden';
  }
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
