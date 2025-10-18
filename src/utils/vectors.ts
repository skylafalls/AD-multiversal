import type { DecimalSource } from "@/typings/break_eternity";
import { solveSimpleBiquadratic } from "./math";

// oxlint-disable max-classes-per-file
export class AffineTransform {
  a01: number;
  a00: number;
  a10: number;
  a11: number;
  o0: number;
  o1: number;

  constructor(a00 = 1, a01 = 0, a10 = 0, a11 = 1, o0 = 0, o1 = 0) {
    this.a00 = a00;
    this.a01 = a01;
    this.a10 = a10;
    this.a11 = a11;
    this.o0 = o0;
    this.o1 = o1;
  }

  times(ot: unknown) {
    if (ot instanceof AffineTransform) {
      return new AffineTransform(
        this.a00 * ot.a00 + this.a01 * ot.a10, this.a00 * ot.a01 + this.a01 * ot.a11,
        this.a10 * ot.a00 + this.a11 * ot.a10, this.a10 * ot.a01 + this.a11 * ot.a11,
        this.a00 * ot.o0 + this.a01 * ot.o1 + this.o0,
        this.a10 * ot.o0 + this.a11 * ot.o1 + this.o1,
      );
    }
    if (ot instanceof Vector) return ot.transformedBy(this);
    throw new Error("unsupported operation");
  }

  translated(offX: number | Vector, offY: number) {
    if (offX instanceof Vector) {
      return new AffineTransform(this.a00, this.a01, this.a10, this.a11, this.o0 + offX.x, this.o1 + offX.y);
    }
    return new AffineTransform(this.a00, this.a01, this.a10, this.a11, this.o0 + offX, this.o1 + offY);
  }

  rotated(angle: number) {
    return AffineTransform.rotation(angle).times(this);
  }

  scaled(scale: number) {
    return AffineTransform.scale(scale).times(this);
  }

  get withoutTranslation() {
    return new AffineTransform(this.a00, this.a01, this.a10, this.a11);
  }

  static translation(offX: number | Vector, offY: number | Vector) {
    if (offX instanceof Vector) {
      return new AffineTransform(1, 0, 0, 1, offX.x, offX.y);
    }
    return new AffineTransform(1, 0, 0, 1, offX, offY);
  }

  static rotation(angle: number) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return new AffineTransform(c, -s, s, c);
  }

  static scale(sc: number) {
    return new AffineTransform(sc, 0, 0, sc);
  }

  static identity() {
    return new AffineTransform();
  }
};

export class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  plus(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  dot(v: Vector) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector) {
    // Produces scalar, z term of 3D vectors
    return this.x * v.y - this.y * v.x;
  }

  minus(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  times(s: number) {
    return new Vector(this.x * s, this.y * s);
  }

  asTranslate() {
    return `translate(${this.x}, ${this.y})`;
  }

  asRotate() {
    return `rotate(${180 / Math.PI * Math.atan2(this.y, this.x)})`;
  }

  toString() {
    return `${this.x}, ${this.y}`;
  }

  round(factor: number) {
    return new Vector(Math.round(this.x * factor) / factor, Math.round(this.y * factor) / factor);
  }

  get copy() {
    return new Vector(this.x, this.y);
  }

  matrixTransform(a00: number, a01: number, a10: number, a11: number) {
    return new Vector(a00 * this.x + a01 * this.y, a10 * this.x + a11 * this.y);
  }

  transformedBy(tform: AffineTransform) {
    return new Vector(tform.a00 * this.x + tform.a01 * this.y + tform.o0,
      tform.a10 * this.x + tform.a11 * this.y + tform.o1);
  }

  get negative() {
    return new Vector(-this.x, -this.y);
  }

  get normalized() {
    return this.times(1 / this.length);
  }

  get right90() {
    return new Vector(this.y, -this.x);
  }

  get left90() {
    return new Vector(-this.y, this.x);
  }

  get angle() {
    return Math.atan2(this.y, this.x);
  }

  static horiz(x: number) {
    return new Vector(x, 0);
  }

  static unitFromRadians(rad: number) {
    return new Vector(Math.cos(rad), Math.sin(rad));
  }

  static unitFromDegrees(deg: number) {
    return Vector.unitFromRadians(deg * Math.PI / 180);
  }
};

export abstract class Curve {
  abstract position(t: number): Vector;
  abstract derivative(t: number): Vector;
  abstract secondDerivative(t: number): Vector;

  curvature(t: number): number {
    const d = this.derivative(t);
    const dd = this.secondDerivative(t);
    const dMag = d.length;
    return d.cross(dd) / (dMag * dMag * dMag);
  }

  shapeAt(t: number) {
    const d = this.derivative(t);
    return {
      t,
      position: this.position(t),
      derivative: d,
      direction: d.normalized,
      curvature: this.curvature(t),
    };
  }

  minimumDistanceTo(pDes: Vector, tMin: number, tMax: number) {
    let tGuess = 0.5 * (tMin + tMax);
    const tTol = Math.max(Math.abs(tMax), Math.abs(tMin)) * Number.EPSILON * 16;
    for (let iter = 0; ; ++iter) {
      const p = this.position(tGuess);
      const d = this.derivative(tGuess);
      const dd = this.secondDerivative(tGuess);
      const offset = p.minus(pDes);
      const dist = offset.length;
      const distDeriv = offset.dot(d) * 2;

      if (distDeriv > 0) tMax = tGuess;
      else tMin = tGuess;

      const distSecondDeriv = (offset.dot(dd) + d.dot(d)) * 2;
      const tStep = distSecondDeriv < 0 ? -dist / distDeriv : -distDeriv / distSecondDeriv;
      if (Math.abs(tStep) < tTol || iter >= 16) return dist;
      tGuess = Math.clamp(tGuess + tStep, tMin, tMax);
    }
  }
};

export class LinearPath extends Curve {
  private p0: Vector;
  private p1: Vector;

  constructor(p0: Vector, p1: Vector) {
    super();
    this.p0 = p0.copy;
    this.p1 = p1.copy;
  }

  position(t: number) {
    return this.p0.times(1 - t).plus(this.p1.times(t));
  }

  derivative() {
    return this.p1.minus(this.p0);
  }

  secondDerivative() {
    return new Vector(0, 0);
  }

  override curvature(_t: number): 0 {
    return 0;
  }

  trimStart(len: number) {
    const dir = this.p1.minus(this.p0).normalized;
    return new LinearPath(this.p0.plus(dir.times(len)), this.p1);
  }

  trimEnd(len: number) {
    const dir = this.p1.minus(this.p0).normalized;
    return new LinearPath(this.p0, this.p1.minus(dir.times(len)));
  }

  transformed(tform: AffineTransform) {
    return new LinearPath(this.p0.transformedBy(tform), this.p1.transformedBy(tform));
  }

  get relativeSVG() {
    const d1 = this.p1.minus(this.p0);
    return `l ${d1.x} ${d1.y}\n`;
  }

  createOffsetLine(offset: any, t0 = 0, t1 = 1) {
    const off = this.p1.minus(this.p0).normalized.right90.times(offset);
    return new LinearPath(this.position(t0).plus(off), this.position(t1).plus(off));
  }

  static connectCircles(p0: Vector, r0: any, p1: Vector, r1: Vector) {
    const dir = p1.minus(p0).normalized;
    return new LinearPath(p0.plus(dir.times(r0)), p1.minus(dir.times(r1)));
  }
};

class CubicBezier extends Curve {
  private p0: Vector;
  private p1: Vector;
  private p2: Vector;
  private p3: Vector;

  constructor(p0: Vector, p1: Vector, p2: Vector, p3: Vector) {
    super();
    this.p0 = p0.copy;
    this.p1 = p1.copy;
    this.p2 = p2.copy;
    this.p3 = p3.copy;
  }

  position(t: number) {
    const nt2 = (1 - t) * (1 - t);
    const t2 = t * t;
    return this.p0.times((1 - t) * nt2)
      .plus(this.p1.times(3 * t * nt2))
      .plus(this.p2.times(3 * t2 * (1 - t)))
      .plus(this.p3.times(t2 * t));
  }

  derivative(t: number) {
    return this.p1.minus(this.p0).times(3 * (1 - t) * (1 - t))
      .plus(this.p2.minus(this.p1).times(6 * t * (1 - t)))
      .plus(this.p3.minus(this.p2).times(3 * t * t));
  }

  secondDerivative(t: number) {
    return this.p2.minus(this.p1.times(2)).plus(this.p0).times(6 * (1 - t))
      .plus(this.p3.minus(this.p2.times(2)).plus(this.p1).times(6 * t));
  }

  transformed(tform: AffineTransform) {
    return new CubicBezier(this.p0.transformedBy(tform), this.p1.transformedBy(tform),
      this.p2.transformedBy(tform), this.p3.transformedBy(tform));
  }

  get relativeSVG() {
    const d1 = this.p1.minus(this.p0);
    const d2 = this.p2.minus(this.p0);
    const d3 = this.p3.minus(this.p0);
    return `c ${d1.x} ${d1.y} ${d2.x} ${d2.y} ${d3.x} ${d3.y}\n`;
  }

  get reverse() {
    return new CubicBezier(this.p3, this.p2, this.p1, this.p0);
  }

  static fitCurveSection(shape0: any, shape1: any) {
    const dP = shape1.position.minus(shape0.position);
    const reversed = shape0.t > shape1.t;
    const pathRotation = shape0.direction.cross(shape1.direction);
    let magSol = solveSimpleBiquadratic(
      1.5 * shape0.curvature, pathRotation, -shape0.direction.cross(dP),
      1.5 * shape1.curvature, pathRotation, shape1.direction.cross(dP));
    magSol = reversed ? magSol.filter((o) => o.x <= 0 && o.y <= 0) : magSol.filter((o) => o.x >= 0 && o.y >= 0);
    if (magSol.length === 0) return null;
    return new CubicBezier(
      shape0.position, shape0.position.plus(shape0.direction.times(magSol[0]?.x)),
      shape1.position.minus(shape1.direction.times(magSol[0]?.y)), shape1.position);
  }
}

// This is an "inset/outset" kind of transform
export class OffsetCurve extends Curve {
  private base: Curve;
  private offset: number;
  constructor(baseCurve: Curve, offset: number) {
    super();
    this.base = baseCurve;
    this.offset = offset;
  }

  position(t: number) {
    const p = this.base.position(t);
    const d = this.base.derivative(t);
    return p.plus(d.normalized.right90.times(this.offset));
  }

  derivative(t: number) {
    return this.base.derivative(t);
  }

  // 2nd derivative not implemented as only curvature is used atm
  override secondDerivative(t: number): Vector {
    throw new Error("Method not implemented.");
  }

  override curvature(t: number) {
    const c = this.base.curvature(t);
    return 1 / (1 / c + this.offset);
  }

  override shapeAt(t: any) {
    const shape = this.base.shapeAt(t);
    return {
      t: shape.t,
      position: shape.position.plus(shape.direction.right90.times(this.offset)),
      derivative: shape.derivative,
      direction: shape.direction,
      curvature: shape.curvature / (1 + this.offset * shape.curvature),
    };
  }
};

export class LogarithmicSpiral extends Curve {
  center: Vector;
  scale: number;
  rate: number;
  constructor(center: Vector, scale: number, rate: number) {
    super();
    this.center = center;
    this.scale = scale;
    this.rate = rate;
  }

  position(t: number) {
    return Vector.unitFromRadians(t)
      .times(this.scale * Math.exp(this.rate * t))
      .plus(this.center);
  }

  derivative(t: number) {
    const unit = Vector.unitFromRadians(t);
    const radius = this.scale * Math.exp(this.rate * t);
    return unit.times(radius * this.rate).plus(unit.left90.times(radius));
  }

  secondDerivative(t: number) {
    const unit = Vector.unitFromRadians(t);
    const radius = this.scale * Math.exp(this.rate * t);
    return unit.times(radius * (this.rate * this.rate - 1))
      .plus(unit.left90.times(2 * radius * this.rate));
  }

  override shapeAt(t: number) {
    const unit = Vector.unitFromRadians(t);
    const radius = this.scale * Math.exp(this.rate * t);
    const ur = unit.times(radius);
    const d = ur.times(this.rate).plus(ur.left90);
    return {
      t,
      position: ur.plus(this.center),
      derivative: d,
      direction: d.normalized,
      curvature: 1 / (Math.abs(radius) * Math.sqrt(1 + this.rate * this.rate)),
    };
  }

  angleFromRadius(r: number) {
    return Math.log(r / this.scale) / this.rate;
  }

  static fromPolarEndpoints(center: Vector, theta0: number, r0: number, theta1: number, r1: number) {
    const rate = Math.log(r1 / r0) / (theta1 - theta0);
    return new LogarithmicSpiral(center, r0 / Math.exp(rate * theta0), rate);
  }
};

export class PiecewisePath {
  path: CubicBezier[];

  constructor(data: CubicBezier[] = []) {
    this.path = data;
  }

  push(element: CubicBezier) {
    this.path.push(element);
  }

  transformedBy(tform: any) {
    return new PiecewisePath(this.path.map((x: { transformed: (arg0: any) => any; }) => x.transformed(tform)));
  }

  toSVG(initialPrefix: number) {
    const p0 = this.path[0]?.position(0);
    const lines = [`${initialPrefix} ${p0?.x} ${p0?.y}\n`];
    for (const part of this.path) lines.push(part.relativeSVG);
    return lines.join("");
  }

  static cubicBezierFitToCurveSection(curve: CubicBezier, t0: any, t1: any, tol = 1, minPieces = 1) {
    const output = new PiecewisePath();
    const shape0 = curve.shapeAt(t0);
    const shape1 = curve.shapeAt(t1);
    function subdivide(shapeStart: any, shapeEnd: any, maxDepth = 8): boolean {
      const shapeMid = curve.shapeAt(0.5 * (shapeStart.t + shapeEnd.t));
      return single(shapeStart, shapeMid, maxDepth - 1)
        && single(shapeMid, shapeEnd, maxDepth - 1);
    }
    function single(shapeStart: any, shapeEnd: any, maxDepth = 8): boolean {
      const singleFit = CubicBezier.fitCurveSection(shapeStart, shapeEnd);
      if (singleFit === null) {
        if (maxDepth <= 0) throw new Error("coulnd't decompose curve");
        return subdivide(shapeStart, shapeEnd, maxDepth);
      }
      const tMid = 0.5 * (shapeStart.t + shapeEnd.t);
      const err = singleFit.minimumDistanceTo(curve.position(tMid), 0, 1);
      if (err > tol) {
        return subdivide(shapeStart, shapeEnd, maxDepth);
      }
      output.push(singleFit);
      return true;
    }
    if (minPieces > 1) subdivide(shape0, shape1);
    else single(shape0, shape1);
    return output;
  }
};

// https://stackoverflow.com/a/9201081
export class ExponentialMovingAverage {
  alpha: number;
  maxOutliers: number;
  highOutlierThreshold: number;
  lowOutlierThreshold: number;
  outliers: number;
  private _average: Decimal;
  constructor(alpha = 0.02, maxOutliers = 5, highOutlierThreshold = 3, lowOutlierThreshold = 0.4) {
    this.alpha = alpha;
    this.maxOutliers = maxOutliers;
    this.highOutlierThreshold = highOutlierThreshold;
    this.lowOutlierThreshold = lowOutlierThreshold;
    this.outliers = 0;
    this._average = new Decimal(0);
  }

  get average() {
    if (this._average.eq(0)) {
      return 0;
    }
    return this._average;
  }

  addValue(value: DecimalSource) {
    if (this._average.eq(0)) {
      this._average = new Decimal(value);
    } else {
      this._average = this._average.add(Decimal.sub(value, this._average).mul(this.average));

      const absValue = Decimal.abs(value);
      const absAverage = Decimal.abs(this._average);
      const highOutlier = absValue.gt(absAverage.mul(this.highOutlierThreshold));
      const lowOutlier = absValue.lt(absAverage.mul(this.lowOutlierThreshold));
      const outlier = highOutlier || lowOutlier;

      if (outlier) {
        this.outliers++;
        if (this.outliers >= this.maxOutliers) {
          this._average = value;
          this.outliers = 0;
        }
      } else {
        this.outliers = 0;
      }
    }
  }
};
