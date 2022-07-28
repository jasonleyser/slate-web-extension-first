import * as React from "react";
import * as ListView from "./ListView";
import * as RovingTabIndex from "./RovingTabIndex";
import * as MultiSelection from "./MultiSelection";
import * as Constants from "../Common/constants";

import InfiniteLoader from "react-window-infinite-loader";

import { getFavicon } from "../Common/favicons";
import { isNewTab } from "../Common/utilities";

const useHistoryInfiniteScroll = ({ onLoadMore, sessionsFeed }) => {
  const shouldFetchMore = React.useRef(true);

  React.useEffect(() => {
    shouldFetchMore.current = true;
  }, [sessionsFeed]);

  const handleInfiniteScroll = () => {
    if (shouldFetchMore.current) {
      onLoadMore();
      shouldFetchMore.current = false;
    }
  };

  return handleInfiniteScroll;
};

/* -----------------------------------------------------------------------------------------------*/

const STYLES_HISTORY_FEED_ROW = {
  width: "calc(100% - 16px)",
  left: "8px",
  transform: "translateY(8px)",
};
const HistoryFeedRow = ({ index, data, onOpenUrl, onObjectHover, style }) => {
  if (!data[index]) return null;

  const { rovingTabIndex, title, visit } = data[index];

  if (title) {
    return (
      <ListView.Title style={{ ...style, ...STYLES_HISTORY_FEED_ROW }}>
        {title}
      </ListView.Title>
    );
  }

  return (
    <ListView.RovingTabIndexWithMultiSelectObject
      key={visit.url}
      withActions
      withMultiSelection
      style={{ ...style, ...STYLES_HISTORY_FEED_ROW }}
      index={rovingTabIndex}
      title={visit.title}
      url={visit.url}
      favicon={visit.favicon}
      relatedVisits={visit.relatedVisits}
      Favicon={getFavicon(visit.rootDomain)}
      isSaved={visit.isSaved}
      onClick={() => onOpenUrl({ urls: [visit.url] })}
      onMouseEnter={() =>
        onObjectHover?.({
          url: visit.url,
          title: visit.title,
        })
      }
    />
  );
};

/* -----------------------------------------------------------------------------------------------*/

const HistoryFeedList = React.forwardRef(
  ({ virtualizedFeed, children, css, ...props }, forwardedRef) => {
    const [listHeight, setListHeight] = React.useState(
      isNewTab ? null : Constants.sizes.jumperFeedWrapper
    );

    const ref = React.useRef();
    React.useEffect(() => {
      if (ref.current) {
        setListHeight(ref.current.offsetHeight);
      }
    }, []);

    if (!listHeight) {
      return <div style={{ height: "100%" }} ref={ref} />;
    }

    return (
      <RovingTabIndex.List>
        <ListView.FixedSizeListRoot
          height={listHeight}
          itemCount={virtualizedFeed.length + 1}
          itemData={virtualizedFeed}
          itemSize={Constants.sizes.jumperFeedItem}
          ref={forwardedRef}
          css={css}
          {...props}
        >
          {children}
        </ListView.FixedSizeListRoot>
      </RovingTabIndex.List>
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * HistoryFeed
 * -----------------------------------------------------------------------------------------------*/

const HistoryFeed = ({
  sessionsFeed,
  sessionsFeedKeys,
  onLoadMore,
  onObjectHover,
  onOpenUrl,
  onGroupURLs,
  css,
  ...props
}) => {
  const historyWrapperRef = React.useRef();
  const handleInfiniteScroll = useHistoryInfiniteScroll({
    onLoadMore,
    historyWrapperRef,
    sessionsFeed,
  });

  const sessionsFeedLength = React.useMemo(() => {
    let length = 0;
    sessionsFeedKeys.forEach((key) => {
      length += sessionsFeed[key].length;
    });
    return length;
  }, [sessionsFeed, sessionsFeedKeys]);

  const virtualizedFeed = React.useMemo(() => {
    let rovingTabIndex = 0;
    let virtualizedFeed = [];

    for (let key of sessionsFeedKeys) {
      sessionsFeed[key].forEach((visit, index) => {
        if (index === 0) {
          virtualizedFeed.push({ title: key });
        }

        virtualizedFeed.push({
          rovingTabIndex,
          visit,
        });

        rovingTabIndex++;
      });
    }

    return virtualizedFeed;
  }, [sessionsFeed, sessionsFeedKeys]);

  const isItemLoaded = (index) => index < virtualizedFeed.length;

  const handleOnSubmitSelectedItem = (index) => {
    let currentLength = 0;

    for (let feedKey of sessionsFeedKeys) {
      const feed = sessionsFeed[feedKey];
      const nextLength = currentLength + feed.length;
      if (index < nextLength) {
        return feed[index - currentLength];
      }
      currentLength = nextLength;
    }
  };

  return (
    <RovingTabIndex.Provider isInfiniteList withFocusOnHover>
      <MultiSelection.Provider
        totalSelectableItems={sessionsFeedLength}
        onSubmitSelectedItem={handleOnSubmitSelectedItem}
      >
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={virtualizedFeed.length + 1}
          loadMoreItems={handleInfiniteScroll}
        >
          {({ onItemsRendered, ref }) => (
            <HistoryFeedList
              virtualizedFeed={virtualizedFeed}
              onItemsRendered={onItemsRendered}
              css={css}
              ref={ref}
              {...props}
            >
              {(props) =>
                HistoryFeedRow({ ...props, onOpenUrl, onObjectHover })
              }
            </HistoryFeedList>
          )}
        </InfiniteLoader>
        <MultiSelection.ActionsMenu
          onOpenURLs={(urls) => onOpenUrl({ urls })}
          onGroupURLs={(urls) => onGroupURLs({ urls, title: "recent" })}
        />
      </MultiSelection.Provider>
    </RovingTabIndex.Provider>
  );
};

export default React.memo(HistoryFeed);
