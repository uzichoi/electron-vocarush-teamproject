import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";

const CustomKeyboard = ({
  focusedInput,
  setPlayer1,
  setPlayer2,
  setGameText,
  onEnter,
  viewType = "config",
  gameValue = ""
}) => {
  const [layoutName, setLayoutName] = useState("default");

  const onKeyPress = (key) => {
    if (focusedInput === "p1") {
      if (key === "{pre}") setPlayer1((prev) => prev.slice(0, -1));
      else if (key === "{space}") setPlayer1((prev) => prev + " ");
      else if (key === "{dot}") setPlayer1((prev) => prev + ".");
      else if (key === "{shift}") {
        setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
      } else if (key === "{enterText}") {
        if (onEnter) onEnter();
      } else setPlayer1((prev) => prev + key);
    }

    else if (focusedInput === "p2") {
      if (key === "{pre}") setPlayer2((prev) => prev.slice(0, -1));
      else if (key === "{space}") setPlayer2((prev) => prev + " ");
      else if (key === "{dot}") setPlayer2((prev) => prev + ".");
      else if (key === "{shift}") {
        setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
      } else if (key === "{enterText}") {
        if (onEnter) onEnter();
      } else setPlayer2((prev) => prev + key);
    }

    else if (focusedInput === "game") {
      console.log("현재 값:", gameValue,"누른키: ",key);
      if (key === "{pre}") setGameText(gameValue.slice(0, -1));
      else if (key === "{space}") setGameText(gameValue + " ");
      else if (key === "{dot}") setGameText(gameValue + ".");
      else if (key === "{shift}") {
        setLayoutName((prev) => (prev === "default" ? "shift" : "default"));
      } else if (key === "{enterText}") {
        if (onEnter) onEnter();
      } else {
        setGameText(gameValue + key);
      }
  }
  };

  return (
    <div className={`keyboard-wrapper keyboard-${viewType}`}>
      <Keyboard
        layoutName={layoutName}
        layout={{
          default: [
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "{shift} z x c v b n m {pre}",
            "{dot} {space} {enterText}",
          ],
          shift: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "{shift} Z X C V B N M {pre}",
            "{dot} {space} {enterText}",
          ],
        }}
        onKeyPress={onKeyPress}
        display={{
          "{enterText}": "Enter",
          "{shift}": "Shift",
          "{dot}": ".",
          "{space}": "Space",
          "{pre}": "←",
        }}
      />
    </div>
  );
};

export default CustomKeyboard;
