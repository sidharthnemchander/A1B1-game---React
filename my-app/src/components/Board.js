import React, { useEffect, useState } from 'react';
import Hint from './Hint';
import Tile from './Tile';

const Board = ({ word, onGameOver, onWin, showMessage }) => {
  // Initialize with arrays that can be individually modified
  const [rows, setRows] = useState(Array(10).fill().map(() => Array(5).fill('')));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [visibleRows, setVisibleRows] = useState(1); // Track number of visible rows
  const [rowHints, setRowHints] = useState(Array(10).fill('')); // Store hints for each row

  // Use effect to set focus on the board
  useEffect(() => {
    const boardElement = document.getElementById('board');
    if (boardElement) {
      boardElement.focus();
    }
  }, []);

  const handleKeyPress = (e) => {
    const keyPressed = e.key.toUpperCase();
    
    if (keyPressed.length === 1 && keyPressed >= 'A' && keyPressed <= 'Z') {
      if (currentRow < 10 && currentCol < 5) {
        // Create a deep copy of the rows array
        const newRows = rows.map(row => [...row]);
        newRows[currentRow][currentCol] = keyPressed;
        setRows(newRows);
        setCurrentCol(currentCol + 1);
      }
    } else if (e.key === 'Backspace' && currentCol > 0) {
      // Create a deep copy of the rows array
      const newRows = rows.map(row => [...row]);
      newRows[currentRow][currentCol - 1] = '';
      setRows(newRows);
      setCurrentCol(currentCol - 1);
    } else if (e.key === 'Enter' && currentCol === 5) {
      const userWord = rows[currentRow].join('');
      checkWord(userWord);
    }
  };

  const checkWord = async (userWord) => {
    const isValid = await checkWordValidity(userWord);
    if (isValid) {
      const hint = CheckLogic(userWord, word);
      
      // Save the hint for the current row
      const newRowHints = [...rowHints];
      newRowHints[currentRow] = hint;
      setRowHints(newRowHints);
      
      if (hint.includes(`A5`)) {
        onWin();
      } else {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
        setVisibleRows(visibleRows + 1); // Increase visible rows
        if (currentRow === 9) {
          onGameOver();
        }
      }
    } else {
      if(userWord === word){
        onWin();
      }
      else{
        showMessage('U sure its a real word?');
      }
      
    }
  };

  const checkWordValidity = async (u_word) => {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${u_word}`);
    return response.ok;
  };

  const CheckLogic = (userword, word) => {
    let A = 0;
    let B = 0;
    for (let i = 0; i < 5; i++) {
      if (word[i] === userword[i]) {
        A++;
      }
    }
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 5; k++) {
        if (j === k) continue;
        if (userword[j] === word[k]) {
          B++;
        }
      }
    }
    return `A${A}B${B}`;
  };

  return (
    <div id="board" onKeyDown={handleKeyPress} tabIndex="0" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      outline: 'none' // Remove focus outline
    }}>
      {rows.map((row, rowIndex) => (
        // Only render rows up to the current visible count
        rowIndex < visibleRows ? (
          <div key={rowIndex} className="row">
            {row.map((tile, colIndex) => (
              <Tile key={colIndex} letter={tile} />
            ))}
            <Hint hint={rowHints[rowIndex]} />
          </div>
        ) : null
      ))}
    </div>
  );
};

export default Board;