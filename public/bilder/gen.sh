convert original/$1 -resize 250x -quality 75 thumb/${1:0:-4}.jpg
convert original/$1 -resize 1200x -quality 80 store/${1:0:-4}.jpg
