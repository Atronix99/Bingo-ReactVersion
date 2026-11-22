# Minecraft Bingo

Aplikacja webowa w React do rozgrywek Minecraft Bingo z obsługą poziomów trudności (Normalny oraz Łatwy), 
losowaniem zestawu osiągnięć, eksportem i importem kodu planszy, pobieraniem planszy jako obraz PNG oraz wbudowanym generatorem drużyn.

- [Strona z której brałem zdjęcia do planszy](https://minecraft.wiki/)

## Funkcje

### Plansza Bingo (6x6):

- Tryb Normalny – losuje przedmioty o różnym poziomie trudności (weight / difficulty 1, 2 oraz 3) z zachowaniem limitów w wierszach i kolumnach.

- Tryb Łatwy – buduje planszę z przedmiotów o trudności 1 i 2.

- Oznaczanie ukończonych pól kliknięciem oraz automatyczne podświetlanie pełnych linii (wierszy i kolumn) jako wygranych.

- Podpowiedź z nazwą przedmiotu podczas najechania kursorem

### Pasek osiągnięć:

- Losuje zestaw osiągnięć (domyślnie 5 pozycji w trybie normalnym).

- Pozwala odhaczać zdobyte osiągnięcia oraz wyświetla ich nazwę i opis w dymku po najechaniu kursorem.

- Posiada zapasową ikonę (images/2/Grass_Block.png) w razie błędu ładowania obrazka osiągnięcia.

### Eksport i import planszy:

- Eksportuje aktualny układ planszy do zakodowanego ciągu tekstowego (Base64) z podglądem i kopiowaniem do schowka.

- Pozwala wkleić kod i odtworzyć planszę

### Eksport do obrazu PNG:

- Generuje zrzut planszy (#bingo-board) za pomocą html2canvas i pobiera go jako minecraft_bingo_board.png.

### Generator drużyn i losowanie:

- Dzielenie listy graczy (po jednym w linii) na drużyny o zadanej liczbie osób lub losowanie pojedynczego zwycięzcy.