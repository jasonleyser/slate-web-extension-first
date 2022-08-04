import * as React from "react";
import * as Styles from "../Common/styles";
import * as SVG from "../Common/SVG";
import * as Typography from "../Components/system/Typography";
import * as Strings from "../Common/strings";
import * as Validations from "../Common/validations";

import { css } from "@emotion/react";
import { Combobox, useComboboxNavigation } from "./ComboboxNavigation";
import { getFavicon } from "../Common/favicons";

/* -------------------------------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------------------------*/

const EditSlatesContext = React.createContext({});

const useEditSlatesContext = () => React.useContext(EditSlatesContext);

const Provider = ({
  children,
  slates: slatesProp,
  objects,
  onCreateSlate,
  onApplySlateToObject,
  onRemoveSlateFromObject,
}) => {
  const [searchValue, setSearchValue] = React.useState("");

  const slates = React.useMemo(() => {
    if (searchValue === "") return slatesProp;

    const searchRegex = new RegExp(searchValue, "gi");
    return slatesProp.filter((slate) => {
      return searchRegex.test(slate);
    });
  }, [slatesProp, searchValue]);

  const canCreateSlate = React.useMemo(() => {
    if (searchValue === "") return false;

    return !slates.some((slate) => slate === searchValue);
  }, [slates, searchValue]);

  const contextValue = React.useMemo(
    () => ({
      searchValue,
      setSearchValue,
      slates,
      objects,
      canCreateSlate,
      onCreateSlate,
      onApplySlateToObject,
      onRemoveSlateFromObject,
    }),
    [
      searchValue,
      canCreateSlate,
      setSearchValue,
      slates,
      objects,
      onCreateSlate,
      onApplySlateToObject,
      onRemoveSlateFromObject,
    ]
  );

  return (
    <EditSlatesContext.Provider value={contextValue}>
      <Combobox.Provider>{children}</Combobox.Provider>
    </EditSlatesContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Input
 * -----------------------------------------------------------------------------------------------*/
const DISMISS_BUTTON_WIDTH = 16;
const STYLES_DISMISS_BUTTON = (theme) => css`
  ${Styles.BUTTON_RESET};
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 32px;
  width: 32px;
  padding: 8px;
  border-radius: 8px;
  color: ${theme.semantic.textGray};

  &:hover {
    background-color: ${theme.semantic.bgGrayLight};
    color: ${theme.semantic.textBlack};
  }

  &:focus {
    background-color: ${theme.semantic.bgGrayLight};
    color: ${theme.semantic.textBlack};
  }
`;

function Dismiss({ css, ...props }) {
  return (
    <button css={[STYLES_DISMISS_BUTTON, css]} {...props}>
      <SVG.Dismiss
        style={{ display: "block" }}
        height={DISMISS_BUTTON_WIDTH}
        width={DISMISS_BUTTON_WIDTH}
      />
    </button>
  );
}

const STYLES_SEARCH_WRAPPER = css`
  ${Styles.HORIZONTAL_CONTAINER_CENTERED};
  position: relative;
  width: 100%;
`;

const STYLES_SEARCH_INPUT = (theme) => css`
  ${Styles.H3};

  font-family: ${theme.font.text};
  -webkit-appearance: none;
  width: 100%;
  height: 56px;
  padding-right: ${DISMISS_BUTTON_WIDTH + 24}px;
  background-color: transparent;
  outline: 0;
  border: none;
  box-sizing: border-box;
  color: ${theme.semantic.textBlack};

  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${theme.semantic.textGrayLight};
    opacity: 1; /* Firefox */
  }

  :-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: ${theme.semantic.textGrayLight};
  }

  ::-ms-input-placeholder {
    /* Microsoft Edge */
    color: ${theme.semantic.textGrayLight};
  }
`;

const useEditSlatesInput = () => {
  const { searchValue, setSearchValue } = useEditSlatesContext();
  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    //NOTE(amine): allow input's value to be empty but keep other validations
    if (Strings.isEmpty(nextValue) || Validations.slatename(nextValue)) {
      setSearchValue(Strings.createSlug(nextValue, ""));
    }
  };
  const clearInputValue = () => setSearchValue("");

  return [searchValue, { handleInputChange, clearInputValue }];
};

const Input = ({ ...props }) => {
  const [value, { handleInputChange, clearInputValue }] = useEditSlatesInput();

  const inputRef = React.useRef();
  const focusInput = () => inputRef.current.focus();

  return (
    <section css={STYLES_SEARCH_WRAPPER}>
      <Combobox.Input>
        <input
          css={[STYLES_SEARCH_INPUT, css]}
          ref={inputRef}
          placeholder="Search or create a tag"
          name="search"
          value={value}
          onChange={handleInputChange}
          autoComplete="off"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          {...props}
        />
      </Combobox.Input>

      {value.length > 0 ? (
        <Dismiss onClick={() => (focusInput(), clearInputValue())} />
      ) : null}
    </section>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Top Panel
 * -----------------------------------------------------------------------------------------------*/

const STYLES_TOP_PANEL_WRAPPER = css`
  height: 48px;
  padding: 0px 16px;
  ${Styles.HORIZONTAL_CONTAINER_CENTERED};
`;

const STYLES_FAVICONS_WRAPPER = css`
  ${Styles.HORIZONTAL_CONTAINER_CENTERED};
  & > * + * {
    margin-left: 8px;
  }
`;

const TopPanel = () => {
  const { objects } = useEditSlatesContext();
  const Favicons = React.useMemo(() => {
    return objects.slice(0, 3).map(({ rootDomain }) => getFavicon(rootDomain));
  }, [objects]);

  return (
    <div css={STYLES_TOP_PANEL_WRAPPER}>
      <div css={STYLES_FAVICONS_WRAPPER}>
        {Favicons.map((Favicon, index) => (
          <Favicon key={index} />
        ))}
      </div>
      <Typography.H5 color="textBlack" style={{ marginLeft: 12 }}>
        Concrete Architecture (@architeg) / Twitter, Nils Frams and 2 more
      </Typography.H5>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Body
 * -----------------------------------------------------------------------------------------------*/

const STYLES_RETURN_KEY = (theme) => css`
  padding: 0px 2px;
  border-radius: 6px;
  background-color: ${theme.semantic.bgBlurLightOP};
`;

const KeyboardInteractionHint = ({ children, ...props }) => {
  return (
    <div css={Styles.HORIZONTAL_CONTAINER_CENTERED} {...props}>
      <Typography.P3 color="textGrayDark">{children}</Typography.P3>
      <Typography.P3
        css={STYLES_RETURN_KEY}
        color="textGray"
        style={{ marginLeft: 4 }}
      >
        ⏎
      </Typography.P3>
    </div>
  );
};

const STYLES_BODY_WRAPPER = css`
  height: 100%;
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const STYLES_OBJECT = css`
  ${Styles.BUTTON_RESET};
  ${Styles.HORIZONTAL_CONTAINER_CENTERED};
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
`;

const STYLES_SLATES_MENU_BUTTON_BLUE = (theme) => css`
  ${STYLES_OBJECT};
  color: ${theme.system.blue};
  &:hover {
    color: ${theme.system.blue};
  }
`;

const STYLES_OBJECT_SELECTED = (theme) => css`
  background-color: ${theme.semantic.bgGrayLight};
`;

const Body = ({ ...props }) => {
  const { slates, searchValue, canCreateSlate } = useEditSlatesContext();
  const { checkIfIndexSelected } = useComboboxNavigation();

  return (
    <Combobox.Menu>
      <div css={STYLES_BODY_WRAPPER} {...props}>
        {slates.map((slate, index) => {
          const isButtonSelected = checkIfIndexSelected(index);

          return (
            <Combobox.MenuButton key={slate} index={index}>
              <button
                css={[
                  STYLES_OBJECT,
                  isButtonSelected && STYLES_OBJECT_SELECTED,
                ]}
              >
                <SVG.Hash height={16} width={16} />
                <Typography.H5
                  as="span"
                  nbrOflines={1}
                  style={{ marginLeft: 12 }}
                >
                  {slate}
                </Typography.H5>
                {isButtonSelected && (
                  <KeyboardInteractionHint style={{ marginLeft: "auto" }}>
                    apply tag
                  </KeyboardInteractionHint>
                )}
              </button>
            </Combobox.MenuButton>
          );
        })}
        {canCreateSlate && (
          <Combobox.MenuButton index={slates.length}>
            <button
              css={[
                STYLES_SLATES_MENU_BUTTON_BLUE,
                checkIfIndexSelected(slates.length) && STYLES_OBJECT_SELECTED,
              ]}
            >
              <SVG.Hash style={{ opacity: 0 }} height={16} width={16} />
              <Typography.H5
                as="span"
                nbrOflines={2}
                style={{ marginLeft: 12 }}
              >
                create new tag “{searchValue}”
              </Typography.H5>
              {checkIfIndexSelected(slates.length) && (
                <KeyboardInteractionHint style={{ marginLeft: "auto" }}>
                  create tag
                </KeyboardInteractionHint>
              )}
            </button>
          </Combobox.MenuButton>
        )}
      </div>
    </Combobox.Menu>
  );
};

export { Provider, Input, TopPanel, Body };