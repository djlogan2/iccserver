SPATH=`pwd`
echo $SPATH > /tmp/run.sh.debug.txt
SPATH="${SPATH}/assets/app/stockfishjs/stockfish.js"
echo $SPATH >> /tmp/run.sh.debug.txt
node --experimental-wasm-threads --experimental-wasm-simd $SPATH
