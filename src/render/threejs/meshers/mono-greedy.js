// The MIT License (MIT)
//
// Copyright (c) 2012-2013 Mikola Lysenko
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function GreedyMesh(volume, dims) {
    function f(i, j, k) {
        return volume[i + dims[0] * (j + dims[1] * k)];
    }
    //Sweep over 3-axes
    var quads = [];
    for (var axis = 0; axis < 3; ++axis) {
    // for(var axis=1; axis<4; ++axis) {
    // for(var axis=2; axis<5; ++axis) {

        var i, j, k, g, w, h, 
            u = (axis + 1) % 3,
            v = (axis + 2) % 3,
            d = [0, 0, 0],
            q = [0, 0, 0],
            mask = new Int32Array(dims[u] * dims[v]);
        q[axis] = 1;
        for (d[axis] = -1; d[axis] < dims[axis];) {
            //Compute mask
            var n = 0;
            for     (d[v] = 0; d[v] < dims[v]; ++d[v])
                for (d[u] = 0; d[u] < dims[u]; ++d[u]) {
                    mask[n++] =
                        (0 <= d[axis] ? f(d[0], d[1], d[2]) : false) !=
                        (d[axis] < dims[axis] - 1 ? f(d[0] + q[0], d[1] + q[1], d[2] + q[2]) : false);
                }
            //Increment d[axis]
            ++d[axis];
            //Generate mesh for mask using lexicographic ordering
            n = 0;
            for (j = 0; j < dims[v]; ++j)
                for (i = 0; i < dims[u];) {
                    if (mask[n]) {
                        //Compute width
                        for (w = 1; mask[n + w] && i + w < dims[u]; ++w) {}
                        //Compute height (this is slightly awkward
                        var done = false;
                        for (h = 1; j + h < dims[v]; ++h) {
                            for (k = 0; k < w; ++k) {
                                if (!mask[n + k + h * dims[u]]) {
                                    done = true;
                                    break;
                                }
                            }
                            if (done) {
                                break;
                            }
                        }
                        //Add quad
                        d[u] = i;
                        d[v] = j;
                        var du = [0, 0, 0]; du[u] = w;
                        var dv = [0, 0, 0]; dv[v] = h;
                        quads.push([
                            [d[0],                  d[1],                   d[2]                ],
                            [d[0] + du[0],          d[1] + du[1],           d[2] + du[2]        ],
                            [d[0] + du[0] + dv[0],  d[1] + du[1] + dv[1],   d[2] + du[2] + dv[2]],
                            [d[0] + dv[0],          d[1] + dv[1],           d[2] + dv[2]        ],
                        ]);
                        //Zero-out mask
                        for (g = 0; g < h; ++g)
                            for (k = 0; k < w; ++k) {
                                mask[n + k + g * dims[u]] = false;
                            }
                        //Increment counters and continue
                        i += w;
                        n += w;
                    } else {
                        ++i;
                        ++n;
                    }
                }
        }
        break
    }
    return quads;
}