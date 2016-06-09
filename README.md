# LetterFall

####[Live!][live]

![screenshot_1]

[live]: http://www.florantedelacruz.com/LetterFall
[screenshot_1]: http://www.florantedelacruz.com/LetterFall/images/LetterFall.png

## Summary

LetterFall is a fast-paced letter racing game using all A-Z keys for movement.
The backend game logic is written in Javascript using object-oriented design and
prototypical inheritance via a utility `#inherits` function. The frontend was
built using HTML, CSS, JavaScript and jQuery.

## How to play

Click [here][live] to play. The main goal is to stay on the falling grid for as
long as possible while collecting yellow tile points. Don't worry, the game only
starts when you make your first move! But be careful, the grid falls faster as
time goes on...

Move your position (cyan) by typing an adjacent key. In the picture above, this
would be either "S", "Z", "F", "N", "A", "B", "Q", or "D". Step on a yellow tile
to increase your score. Move on to a green tile to slow down the grid speed.

Here are some variants you can try out:
* Easier mode: Stay alive as long as possible (maximize your "lines" score only).
* Hard mode: Get a high score without using any green tiles.

## Todo

* Add persistent score tracking by converting to a Rails App and storing high
scores on the database
