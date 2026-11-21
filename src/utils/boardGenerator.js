import shuffle from './shuffle';

export const BOARD_SIZE = 6;

const buildBoardItems = (allItems, selectedMode = 'normal', fixedItems = null) => {
  if (!allItems || allItems.length === 0) {
    return { error: 'Błąd: Brak wczytanych przedmiotów.', items: null };
  }

  if (fixedItems && fixedItems.length === BOARD_SIZE * BOARD_SIZE) {
    const finalItems = fixedItems.map((name) =>
      allItems.find((item) => item.name === name.replace(/_/g, ' '))
    );
    if (finalItems.some((item) => !item)) {
      return { error: 'Błąd: Kod planszy zawiera nieznane przedmioty.', items: null };
    }
    return { error: null, items: finalItems };
  }

  if (selectedMode === 'easy') {
    const required2 = BOARD_SIZE * (BOARD_SIZE / 2);
    const required1 = BOARD_SIZE * (BOARD_SIZE / 2);

    if (BOARD_SIZE % 2 !== 0) {
      return {
        error: 'Błąd: Tryb łatwy jest dostępny tylko dla parzystych rozmiarów planszy (np. 6x6).',
        items: null,
      };
    }

    const itemsByWeight = {
      1: shuffle(allItems.filter((item) => item.weight === 1)),
      2: shuffle(allItems.filter((item) => item.weight === 2)),
    };

    if (itemsByWeight[1].length < required1 || itemsByWeight[2].length < required2) {
      return {
        error: 'Błąd: Za mało przedmiotów difficulty 1 lub 2 dla trybu łatwego. Użyj trybu Normalnego.',
        items: null,
      };
    }

    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    const rowCount = { 1: Array(BOARD_SIZE).fill(0), 2: Array(BOARD_SIZE).fill(0) };
    const colCount = { 1: Array(BOARD_SIZE).fill(0), 2: Array(BOARD_SIZE).fill(0) };
    const usedIndices = { 1: [], 2: [] };
    const MAX_COUNT = BOARD_SIZE / 2;

    const getAvailableItem = (weight) => {
      const itemIndex = itemsByWeight[weight].findIndex(
        (_, index) => !usedIndices[weight].includes(index)
      );
      if (itemIndex > -1) {
        const item = itemsByWeight[weight][itemIndex];
        usedIndices[weight].push(itemIndex);
        return item;
      }
      return null;
    };

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        let selectedWeight;

        const count1r = rowCount[1][r];
        const count2r = rowCount[2][r];
        const count1c = colCount[1][c];
        const count2c = colCount[2][c];

        const mustBe2Row = count2r < MAX_COUNT && count1r === MAX_COUNT;
        const mustBe2Col = count2c < MAX_COUNT && count1c === MAX_COUNT;
        const mustBe1Row = count1r < MAX_COUNT && count2r === MAX_COUNT;
        const mustBe1Col = count1c < MAX_COUNT && count2c === MAX_COUNT;

        if (mustBe2Row || mustBe2Col) {
          selectedWeight = 2;
        } else if (mustBe1Row || mustBe1Col) {
          selectedWeight = 1;
        } else {
          const canBe2 = count2r < MAX_COUNT && count2c < MAX_COUNT;
          const canBe1 = count1r < MAX_COUNT && count1c < MAX_COUNT;

          if (canBe2 && canBe1) {
            const remaining1 = required1 - usedIndices[1].length;
            const remaining2 = required2 - usedIndices[2].length;

            if (remaining1 > 0 && remaining2 > 0) {
              selectedWeight = remaining1 / (remaining1 + remaining2) > Math.random() ? 1 : 2;
            } else if (remaining1 > 0) {
              selectedWeight = 1;
            } else if (remaining2 > 0) {
              selectedWeight = 2;
            } else {
              return { error: 'Błąd: Nieoczekiwane wyczerpanie przedmiotów!', items: null };
            }
          } else if (canBe2) {
            selectedWeight = 2;
          } else if (canBe1) {
            selectedWeight = 1;
          } else {
            return {
              error: 'Błąd: Niespełnione warunki 3x difficulty 1 i 3x difficulty 2. Zresetuj planszę.',
              items: null,
            };
          }
        }

        let item = getAvailableItem(selectedWeight);
        if (!item) {
          const otherWeight = selectedWeight === 1 ? 2 : 1;
          const otherItem = getAvailableItem(otherWeight);
          if (
            otherItem &&
            rowCount[otherWeight][r] < MAX_COUNT &&
            colCount[otherWeight][c] < MAX_COUNT
          ) {
            selectedWeight = otherWeight;
            item = otherItem;
          } else {
            return {
              error: 'Błąd: Wyczerpano dostępne przedmioty lub kolizja z rozkładem 3x3! Spróbuj ponownie.',
              items: null,
            };
          }
        }

        board[r][c] = item;
        rowCount[selectedWeight][r]++;
        colCount[selectedWeight][c]++;
      }
    }

    return { error: null, items: board.flat() };
  }

  // Tryb normalny
  const required3 = BOARD_SIZE;
  const required2 = 15;
  const required1 = BOARD_SIZE * BOARD_SIZE - required3 - required2;

  const itemsByWeight = {
    1: allItems.filter((item) => item.weight === 1),
    2: allItems.filter((item) => item.weight === 2),
    3: allItems.filter((item) => item.weight === 3),
  };

  if (itemsByWeight[3].length < required3) {
    return {
      error: `Błąd: Za mało przedmiotów difficulty 3. Potrzeba ${required3}.`,
      items: null,
    };
  }

  const totalItems = BOARD_SIZE * BOARD_SIZE;
  const usedIndices = { 1: [], 2: [], 3: [] };
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  const getAvailableItems = (weight, count) => {
    const available = itemsByWeight[weight].filter((_, index) => !usedIndices[weight].includes(index));
    return shuffle(available).slice(0, count);
  };

  const pool3 = getAvailableItems(3, required3);
  const colIndices = shuffle(Array.from({ length: BOARD_SIZE }, (_, i) => i));

  for (let r = 0; r < BOARD_SIZE; r++) {
    const c = colIndices[r];
    const item = pool3[r];
    board[r][c] = item;
    usedIndices[3].push(itemsByWeight[3].findIndex((i) => i.name === item.name));
  }

  const rowCount = { 1: Array(BOARD_SIZE).fill(0), 2: Array(BOARD_SIZE).fill(0) };
  const colCount = { 1: Array(BOARD_SIZE).fill(0), 2: Array(BOARD_SIZE).fill(0) };

  const MIN_WEIGHT_1 = 2;
  const MAX_WEIGHT_1 = 3;
  const MIN_WEIGHT_2 = 2;
  const MAX_WEIGHT_2 = 3;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;

      const flatBoard = board.flat();
      const current2 = flatBoard.filter((i) => i && i.weight === 2).length;
      const current1 = flatBoard.filter((i) => i && i.weight === 1).length;
      const remainingCells = totalItems - flatBoard.filter((i) => i !== null).length;

      const needed2 = required2 - current2;
      const needed1 = required1 - current1;

      let selectedWeight;

      const mustBe2Global = needed2 > 0 && needed2 === remainingCells;
      const mustBe2Row = rowCount[2][r] < MIN_WEIGHT_2 && rowCount[1][r] === MAX_WEIGHT_1;
      const mustBe2Col = colCount[2][c] < MIN_WEIGHT_2 && colCount[1][c] === MAX_WEIGHT_1;

      const mustBe1Global = needed1 > 0 && needed1 === remainingCells;
      const mustBe1Row = rowCount[1][r] < MIN_WEIGHT_1 && rowCount[2][r] === MAX_WEIGHT_2;
      const mustBe1Col = colCount[1][c] < MIN_WEIGHT_1 && colCount[2][c] === MAX_WEIGHT_2;

      if (mustBe2Global || mustBe2Row || mustBe2Col) {
        selectedWeight = 2;
      } else if (mustBe1Global || mustBe1Row || mustBe1Col) {
        selectedWeight = 1;
      } else {
        const canBe2 = rowCount[2][r] < MAX_WEIGHT_2 && colCount[2][c] < MAX_WEIGHT_2 && needed2 > 0;
        const canBe1 = rowCount[1][r] < MAX_WEIGHT_1 && colCount[1][c] < MAX_WEIGHT_1 && needed1 > 0;

        if (canBe2 && canBe1) {
          selectedWeight = Math.random() < 0.7 ? 2 : 1;
        } else if (canBe2) {
          selectedWeight = 2;
        } else if (canBe1) {
          selectedWeight = 1;
        } else {
          return {
            error: 'Błąd: Niespełnione warunki alokacji 1/2. Zresetuj planszę.',
            items: null,
          };
        }
      }

      let pool = getAvailableItems(selectedWeight, 1);
      if (pool.length === 0) {
        const otherWeight = selectedWeight === 1 ? 2 : 1;
        const otherPool = getAvailableItems(otherWeight, 1);
        if (otherPool.length > 0) {
          selectedWeight = otherWeight;
          pool = otherPool;
        } else {
          return {
            error: 'Błąd: Wyczerpano dostępne przedmioty! Zresetuj planszę.',
            items: null,
          };
        }
      }

      const item = pool[0];
      board[r][c] = item;
      rowCount[selectedWeight][r]++;
      colCount[selectedWeight][c]++;
      usedIndices[selectedWeight].push(
        itemsByWeight[selectedWeight].findIndex((i) => i.name === item.name)
      );
    }
  }

  return { error: null, items: board.flat() };
}

export function calculateWinIndices(completedSet, size = BOARD_SIZE) {
  const winIndices = new Set();

  for (let r = 0; r < size; r++) {
    const rowIndices = Array.from({ length: size }, (_, c) => r * size + c);
    if (rowIndices.every((idx) => completedSet.has(idx))) {
      rowIndices.forEach((idx) => winIndices.add(idx));
    }
  }

  for (let c = 0; c < size; c++) {
    const colIndices = Array.from({ length: size }, (_, r) => r * size + c);
    if (colIndices.every((idx) => completedSet.has(idx))) {
      colIndices.forEach((idx) => winIndices.add(idx));
    }
  }

  return winIndices;
}

export default buildBoardItems;