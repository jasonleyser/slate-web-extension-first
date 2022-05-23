import * as React from "react";
import * as Styles from "../Common/styles";
import * as SVG from "../Common/SVG";
import * as Navigation from "../Core/navigation/app/jumper";
import * as Views from "../Components/Views";
import * as Search from "../Components/Search";

import HistoryFeed from "../Components/HistoryFeed";
import WindowsFeed from "../Components/WindowsFeed";
import RelatedLinksFeed from "../Components/RelatedLinksFeed";

import { Divider } from "../Components/Divider";
import { css } from "@emotion/react";
import {
  useHistory,
  useViews,
  useHistorySearch,
} from "../Core/history/app/jumper";
import { useMediaQuery } from "../Common/hooks";
import { Switch, Match } from "../Components/Switch";
import { useGetRelatedLinks } from "../Core/history/app/jumper";
import { ComboboxNavigation } from "Components/ComboboxNavigation";

/* -------------------------------------------------------------------------------------------------
 * Related Links Popup
 * -----------------------------------------------------------------------------------------------*/
const STYLES_RELATED_LINKS_POPUP = (theme) => css`
  position: absolute;
  height: 376px;
  width: calc(((100vw - ${MODALS_WIDTH}px) / 2) - 24px * 2);
  max-width: 348px;
  bottom: 0%;
  right: -16px;
  transform: translateX(100%);
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  border-radius: 24px;
  box-shadow: ${theme.shadow.lightLarge};
  border: 1px solid ${theme.semantic.borderGrayLight};

  background-color: ${theme.semantic.bgWhite};
  @supports (
    (-webkit-backdrop-filter: blur(75px)) or (backdrop-filter: blur(75px))
  ) {
    -webkit-backdrop-filter: blur(75px);
    backdrop-filter: blur(75px);
    background-color: ${theme.semantic.bgBlurLightOP};
  }
`;

function RelatedLinksPopup({ preview }) {
  const isMatchingQuery = useMediaQuery((sizes) => sizes.desktopM);

  const relatedLinksFeed = useGetRelatedLinks(
    isMatchingQuery ? preview?.url : null
  );

  if (isMatchingQuery || !preview) return null;

  return (
    <RelatedLinksFeed
      css={STYLES_RELATED_LINKS_POPUP}
      feed={relatedLinksFeed}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * History Scene
 * -----------------------------------------------------------------------------------------------*/

const jumperFadeInAnimation = css`
  @keyframes jumper-fade-in {
    0% {
      opacity: 0;
      transform: translateY(100px);
    }
    57% {
      opacity: 0;
      transform: translateY(100px);
    }
    100% {
      opacity: 1;
      transform: translateY(0px);
    }
  }

  animation: jumper-fade-in 350ms ease;
`;

const MODALS_WIDTH = 696;
const STYLES_APP_MODAL_POSITION = css`
  height: 432px;
  width: ${MODALS_WIDTH}px;
  position: fixed;
  z-index: 23423423432;
  top: 50%;
  left: 50%;
  margin-left: calc(-696px / 2);
  margin-top: calc(-548px / 2);
`;

const STYLES_APP_MODAL = (theme) => css`
  ${Styles.VERTICAL_CONTAINER};
  position: relative;
  height: 100%;
  width: 100%;
  border: 1px solid ${theme.semantic.borderGrayLight4};
  box-shadow: ${theme.shadow.darkLarge};
  //NOTE(amine): when changing border-radius, change it also in STYLES_MARBLE_WRAPPER and STYLES_APP_MODAL_BACKGROUND
  border-radius: 16px;
  overflow: hidden;

  ${jumperFadeInAnimation};
`;

const STYLES_MARBLE_WRAPPER = css`
  position: absolute;
  top: 0%;
  left: 0%;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  z-index: -1;

  ${jumperFadeInAnimation};
`;

const STYLES_APP_MODAL_BACKGROUND = (theme) => css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background-color: ${theme.semantic.white};
  border-radius: 16px;
  @supports (
    (-webkit-backdrop-filter: blur(75px)) or (backdrop-filter: blur(75px))
  ) {
    -webkit-backdrop-filter: blur(75px);
    backdrop-filter: blur(75px);
    background-color: ${theme.semantic.bgBlurWhite};
  }

  ${jumperFadeInAnimation};
`;

const STYLES_VIEWS_MENU_WRAPPER = (theme) => css`
  ${Styles.HORIZONTAL_CONTAINER};
  position: absolute;
  z-index: -1;
  left: 0%;
  top: -17px;
  transform: translateY(-100%);

  border-radius: 16px;
  background-color: white;
  border: 1px solid ${theme.semantic.borderGrayLight4};
  box-shadow: ${theme.shadow.darkLarge};

  @supports (
    (-webkit-backdrop-filter: blur(75px)) or (backdrop-filter: blur(75px))
  ) {
    -webkit-backdrop-filter: blur(75px);
    backdrop-filter: blur(75px);
    background-color: ${theme.semantic.bgBlurWhiteOP};
  }

  @keyframes views-menu-fade-in {
    from {
      opacity: 0;
      transform: translateY(calc(-100% + 16px));
    }
    to {
      opacity: 1;
      transform: translateY(-100%);
    }
  }

  animation: views-menu-fade-in 200ms ease;
`;

// const STYLES_FILTER_TOGGLE_BUTTON = (theme) => css`
//   ${Styles.BUTTON_RESET};
//   position: absolute;
//   top: 50%;
//   transform: translateY(-50%);
//   right: 16px;

//   width: 32px;
//   height: 32px;
//   border-radius: 8px;
//   padding: 8px;
//   background-color: ${theme.semantic.bgGrayLight};
//   color: ${theme.system.blue};
// `;

// const STYLES_FILTER_BUTTON = (theme) => css`
//   ${Styles.BUTTON_RESET};
//   ${Styles.HORIZONTAL_CONTAINER_CENTERED};
//   border-radius: 12px;
//   padding: 5px 12px 7px;
//   width: 78px;
//   border: 1px solid ${theme.semantic.borderGrayLight};
//   color: ${theme.system.blue};
// `;

export default function History() {
  const [preview, setPreview] = React.useState();

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") Navigation.closeExtensionJumper();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const inputRef = React.useRef();
  const [search, { handleInputChange, clearSearch }] = useHistorySearch({
    inputRef,
  });

  const { sessionsFeed, sessionsFeedKeys, windowsFeed, loadMoreHistory } =
    useHistory();

  const { viewsFeed, currentViewQuery, viewsType, getViewsFeed, currentView } =
    useViews();

  const handleOnObjectHover = React.useCallback(
    ({ url }) => setPreview({ type: "link", url }),
    []
  );

  // NOTE(amine) don't render the app when history isn't available
  if (sessionsFeedKeys.length === 0) return null;

  return (
    <div css={STYLES_APP_MODAL_POSITION}>
      <Views.Provider
        viewsFeed={viewsFeed}
        currentView={currentView}
        currentViewQuery={currentViewQuery}
        viewsType={viewsType}
        getViewsFeed={getViewsFeed}
      >
        <Views.Menu css={STYLES_VIEWS_MENU_WRAPPER} />

        <RelatedLinksPopup preview={preview} />

        <div css={STYLES_APP_MODAL}>
          <ComboboxNavigation.Provider
            isInfiniteList={currentView === viewsType.recent}
          >
            <Search.Provider
              onInputChange={handleInputChange}
              search={search}
              clearSearch={clearSearch}
            >
              <Search.Input ref={inputRef} />

              <Divider color="borderGrayLight" />
              <section
                css={Styles.HORIZONTAL_CONTAINER}
                style={{ height: "100%", flex: 1, overflow: "hidden" }}
              >
                <Switch>
                  <Match
                    when={search.query.length > 0 && search.result}
                    component={Search.Feed}
                    setPreview={setPreview}
                  />
                  <Match
                    when={currentView === viewsType.recent}
                    component={HistoryFeed}
                    sessionsFeed={sessionsFeed}
                    sessionsFeedKeys={sessionsFeedKeys}
                    onLoadMore={loadMoreHistory}
                    onObjectHover={handleOnObjectHover}
                    onOpenUrl={Navigation.openUrls}
                  />
                  <Match
                    when={
                      currentView === viewsType.currentWindow ||
                      currentView === viewsType.allOpen
                    }
                    component={WindowsFeed}
                    windowsFeed={windowsFeed}
                    displayAllOpen={currentView === viewsType.allOpen}
                    onObjectHover={handleOnObjectHover}
                    onOpenUrl={Navigation.openUrls}
                  />
                  <Match
                    when={currentView === viewsType.relatedLinks}
                    component={Views.Feed}
                    onOpenUrl={Navigation.openUrls}
                    onObjectHover={handleOnObjectHover}
                  />
                </Switch>
              </section>
            </Search.Provider>
          </ComboboxNavigation.Provider>
        </div>
      </Views.Provider>
      <div css={STYLES_MARBLE_WRAPPER}>
        <SVG.Marble />
      </div>
      <div css={STYLES_APP_MODAL_BACKGROUND} />
    </div>
  );
}
