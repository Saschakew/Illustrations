function  getB(phi) {
    let B = [
        [Math.cos(phi), - Math.sin(phi)],
        [Math.sin(phi), Math.cos(phi)]
    ];

    return B
}