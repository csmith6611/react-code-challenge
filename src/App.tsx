import { NewsFeedScroller } from "./components/scroller/NewsFeedScroller";

function App() {
  return (
    <>
      <NewsFeedScroller />
    </>
  );
}

export default App;

/*

Header area

News feed scroller (driven by axios hook)
  -Card
    -Title
    -Author
    -Points
    -Time Since Posted (dayjs will work nicely)
    -Optional Comment Count
    -Favoriting Posts (local sotrage)
    -Modal
      -Title
      -Clickable URL
      -Snippet (first 500 chars)
      -Close

Hooks
  -useInfiniteScroll (custom built)
  -useAxios
  -useLocalStorage
  -useModal (handled by ant design)

Contexts
  -ThemeContext (optional)

-Components
  -Card Structure
  -Modal Structure
  -Infinite Scroll Structure
  -Header Structure
  -Loaders


*/
