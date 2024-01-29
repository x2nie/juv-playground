/**
 * Original Code:
 *      https://github.com/microsoft/referencesource/blob/master/mscorlib/system/random.cs
 *      https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.CoreLib/src/System/Random.cs
 * Converted to TypeScript By: x2nie
 * Date: 2023-11-19
 *
 */

// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

const Int32 = {
   MinValue: Math.pow(2, 31) * -1,
   MaxValue: Math.pow(2, 31) - 1,
};
const MBIG = Int32.MaxValue;
const OneBIGth = 1.0 / MBIG;
const MSEED = 161803398;
const CLAMPER = new Float32Array(1);

export class Random {
   //
   // Member Variables
   //
   private inext: number;
   private inextp: number;
   //private int[] SeedArray = new int[56];
   private SeedArray: Int32Array;

   // public Random(Seed:number) {}
   constructor(Seed: number | undefined = undefined) {
      this.inext = 0;
      this.inextp = 21;
      this.SeedArray = new Int32Array(56);
      this.SeedArray.fill(0);

      if (Seed === undefined) {
         //this(Environment.TickCount);
         Seed = Math.floor(Math.random() * MBIG);
      }
      Seed = Math.floor(Seed); // = int()Seed

      let ii : number;
      let mj: number, mk : number;
      //Initialize our Seed array.
      //This algorithm comes from Numerical Recipes in C (2nd Ed.)
      let subtraction = (Seed == Int32.MinValue) ? Int32.MaxValue : Math.abs(Seed);
      mj = MSEED - subtraction;
      this.SeedArray[55] = mj;
      mk = 1;
      for (let i = 1; i < 55; i++) {
         //Apparently the range [1..55] is special (Knuth) and so we're wasting the 0'th position.
         ii = (21 * i) % 55;
         this.SeedArray[ii] = mk;
         mk = mj - mk;
         if (mk < 0) mk += MBIG;
         mj = this.SeedArray[ii];
      }
      for (let k = 1; k < 5; k++) {
         for (let i = 1; i < 56; i++) {
            this.SeedArray[i] -= this.SeedArray[1 + (i + 30) % 55];
            if (this.SeedArray[i] < 0) this.SeedArray[i] += MBIG;
         }
      }
         }

   public Next(maxValue: number = 0): number {
      if (maxValue == 0)
            return this.InternalSample()

      if (maxValue < 0) {
         throw new Error("ArgumentOutOfRange_MustBePositive");
      }
            return Math.floor(this.Sample() * maxValue);
   }

   public NextDouble(): number {
            return this.Sample();
   }

   protected Sample(): number {
      //Float.double
      //Including this division at the end gives us significantly improved
      //random number distribution.
      // return this.InternalSample()*OneBIGth;
      CLAMPER[0] = this.InternalSample() * OneBIGth;
      return CLAMPER[0];

      // below also works, but with a big slower

      // const jsFloat = this.InternalSample()*OneBIGth;
      // const csharpDouble = jsFloat.toPrecision(15); //got string
      // const n = Number(csharpDouble); // will identical to C# value
      // return n;
   }

   private InternalSample(): number { // int
      let retVal : number;
      let locINext = this.inext;
      let locINextp = this.inextp;

      if (++locINext >= 56) locINext = 1;
      if (++locINextp >= 56) locINextp = 1;

      retVal = this.SeedArray[locINext] - this.SeedArray[locINextp];

      if (retVal == MBIG) retVal--;
      if (retVal < 0) retVal += MBIG;

      this.SeedArray[locINext] = retVal;

      this.inext = locINext;
      this.inextp = locINextp;

      return retVal;
   }
}