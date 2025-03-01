Below is an updated README incorporating **emojis** to add a bit more flair and personality. Adjust as you see fit!

---

# Highest-Grossing Films Dashboard 🎬

A comprehensive project that **scrapes Wikipedia** 🕵️‍♂️, **cleans and stores film data** in a database, and **presents** it through an interactive, dark-themed **web dashboard** hosted on GitHub Pages. The web page includes multiple charts 📊, key statistics, and an interactive table with insights for each film.

## Overview 🌎

This project demonstrates **end-to-end data wrangling** 👩‍💻, from **web scraping** a Wikipedia page on the [List of highest-grossing films](https://en.wikipedia.org/wiki/List_of_highest-grossing_films), **cleaning** and storing the data in a relational database, and finally **visualizing** it in an interactive dashboard built with HTML, CSS, JavaScript, and [Chart.js](https://www.chartjs.org/). The final dashboard is hosted on **GitHub Pages** 🚀, allowing anyone to explore the data, filter the table, and view insights about each film.

---

## Features ✨

- **Data Scraping** 🏗️: Uses Python, `requests`, and `BeautifulSoup` to parse the Wikipedia table(s).  
- **Database Storage** 💾: Inserts raw film entries into an SQLite database, with columns for title, release year, director(s), box office, and country.  
- **Data Cleaning with LLM** 🧠: Optional step that leverages a local Large Language Model endpoint to remove bracketed references, standardize box office values, and unify country names.  
- **Film Insights** 💡: Automatically generates a short insight (one sentence) for each film, stored in a `film_insights` table.  
- **JSON Export** 📦: Compiles cleaned data into a single `films.json` file for easy front-end consumption.  
- **Interactive Dashboard**:
  - **4 Charts** 📈: Top 10 Highest-Grossing Films, Director Leaderboard, Box Office Over Time, and Country Distribution.  
  - **Search & Sort Table** 🔎: Filter by title, and sort by release year or box office.  
  - **Tooltips & Insights** 💬: Hover over table rows or chart bars to see additional details (like box office or film insight).

## Data Cleaning with LLM 🤖

**Optional Step**: The code includes functions to call a local Large Language Model (LLM) endpoint to “clean” the data. Specifically, it can:

1. Remove bracket references (like `[1]`).
2. Standardize currency to numeric box office values.
3. Generate short insights for each film.

This requires:
- An environment variable `LLM_ENDPOINT` or a direct URL for your LLM server.
- Adjust the code accordingly if you use a different model or platform (e.g., OpenAI API).

---

## Exporting to JSON 📂

The last cell in the notebook **reads** from `films.db` and **joins** the `film_insights` table to incorporate each film’s short insight. It then writes all combined data into `films.json`. This JSON is essential for the front-end to be hosted on GitHub Pages.

---

## Front-End Web Page 🌐

- **`index.html`**: The core HTML structure.  
- **`styles.css`**: Provides a sleek dark theme with a gold accent color.  
- **`script.js`**: 
  1. Fetches `films.json`.  
  2. Computes top-level stats (Film Count, Highest Single Film Gross, etc.).  
  3. Renders four charts (using [Chart.js](https://www.chartjs.org/)).  
  4. Creates an interactive table with searching, sorting, and tooltips.

Enjoy exploring the **billion-dollar blockbusters** and seeing how they’ve shaped our cinematic world! 🌟  
