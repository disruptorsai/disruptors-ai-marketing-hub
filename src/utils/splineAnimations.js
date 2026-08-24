/**
 * Spline Animation Utilities
 *
 * Comprehensive utilities for managing 3D scene interactions, animations,
 * and object manipulations in Spline scenes. Provides a standardized API
 * for common 3D animation patterns with performance optimizations.
 *
 * Features:
 * - Object manipulation and animation utilities
 * - Camera control and smooth transitions
 * - Lighting and material animations
 * - Performance-optimized update cycles
 * - Error handling and fallback mechanisms
 * - Scroll-based animation calculations
 */

/**
 * Easing functions for smooth animations
 */
export const easingFunctions = {
  // Basic easing functions
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic easing
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quartic easing
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  // Elastic and back easing
  easeOutElastic: (t) => Math.sin(-13 * Math.PI / 2 * (t + 1)) * Math.pow(2, -10 * t) + 1,
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Bounce easing
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

/**
 * Animation manager class for handling complex 3D scene animations
 */
export class SplineAnimationManager {
  constructor(splineApp) {
    this.splineApp = splineApp;
    this.animationQueue = [];
    this.activeAnimations = new Map();
    this.isAnimating = false;
    this.frameId = null;
    this.lastTime = 0;

    // Performance tracking
    this.performanceMetrics = {
      frameCount: 0,
      averageFPS: 60,
      lastFPSCheck: performance.now()
    };
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.lastTime = performance.now();
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isAnimating = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    if (!this.isAnimating) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update performance metrics
    this.updatePerformanceMetrics(currentTime);

    // Process active animations
    this.processAnimations(deltaTime);

    this.frameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(currentTime) {
    this.performanceMetrics.frameCount++;

    if (currentTime - this.performanceMetrics.lastFPSCheck >= 1000) {
      this.performanceMetrics.averageFPS =
        (this.performanceMetrics.frameCount * 1000) /
        (currentTime - this.performanceMetrics.lastFPSCheck);

      this.performanceMetrics.frameCount = 0;
      this.performanceMetrics.lastFPSCheck = currentTime;
    }
  }

  /**
   * Process all active animations
   */
  processAnimations(deltaTime) {
    for (const [id, animation] of this.activeAnimations) {
      animation.elapsed += deltaTime;
      const progress = Math.min(animation.elapsed / animation.duration, 1);
      const easedProgress = animation.easing(progress);

      try {
        animation.update(easedProgress);

        if (progress >= 1) {
          if (animation.onComplete) animation.onComplete();
          this.activeAnimations.delete(id);
        }
      } catch (error) {
        console.warn(`Animation ${id} failed:`, error);
        this.activeAnimations.delete(id);
      }
    }
  }

  /**
   * Add a new animation to the queue
   */
  addAnimation(id, config) {
    const animation = {
      id,
      elapsed: 0,
      duration: config.duration || 1000,
      easing: config.easing || easingFunctions.easeOutQuad,
      update: config.update,
      onComplete: config.onComplete,
      ...config
    };

    this.activeAnimations.set(id, animation);

    if (!this.isAnimating) {
      this.start();
    }

    return id;
  }

  /**
   * Remove an animation
   */
  removeAnimation(id) {
    return this.activeAnimations.delete(id);
  }

  /**
   * Clear all animations
   */
  clearAnimations() {
    this.activeAnimations.clear();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
}

/**
 * Object manipulation utilities
 */
export const splineObjectUtils = {
  /**
   * Smoothly animate object rotation
   */
  animateRotation(object, targetRotation, duration = 1000, easing = easingFunctions.easeOutQuad) {
    if (!object) return null;

    const startRotation = {
      x: object.rotation.x,
      y: object.rotation.y,
      z: object.rotation.z
    };

    return {
      duration,
      easing,
      update: (progress) => {
        object.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * progress;
        object.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * progress;
        object.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * progress;
      }
    };
  },

  /**
   * Smoothly animate object position
   */
  animatePosition(object, targetPosition, duration = 1000, easing = easingFunctions.easeOutQuad) {
    if (!object) return null;

    const startPosition = {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z
    };

    return {
      duration,
      easing,
      update: (progress) => {
        object.position.x = startPosition.x + (targetPosition.x - startPosition.x) * progress;
        object.position.y = startPosition.y + (targetPosition.y - startPosition.y) * progress;
        object.position.z = startPosition.z + (targetPosition.z - startPosition.z) * progress;
      }
    };
  },

  /**
   * Smoothly animate object scale
   */
  animateScale(object, targetScale, duration = 1000, easing = easingFunctions.easeOutQuad) {
    if (!object) return null;

    const startScale = {
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z
    };

    // Handle uniform scaling
    if (typeof targetScale === 'number') {
      targetScale = { x: targetScale, y: targetScale, z: targetScale };
    }

    return {
      duration,
      easing,
      update: (progress) => {
        object.scale.x = startScale.x + (targetScale.x - startScale.x) * progress;
        object.scale.y = startScale.y + (targetScale.y - startScale.y) * progress;
        object.scale.z = startScale.z + (targetScale.z - startScale.z) * progress;
      }
    };
  },

  /**
   * Animate object along a path
   */
  animateAlongPath(object, path, duration = 2000, easing = easingFunctions.easeInOutQuad) {
    if (!object || !path || path.length < 2) return null;

    return {
      duration,
      easing,
      update: (progress) => {
        const segmentIndex = Math.floor(progress * (path.length - 1));
        const segmentProgress = (progress * (path.length - 1)) - segmentIndex;

        const currentPoint = path[segmentIndex];
        const nextPoint = path[Math.min(segmentIndex + 1, path.length - 1)];

        object.position.x = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
        object.position.y = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;
        object.position.z = currentPoint.z + (nextPoint.z - currentPoint.z) * segmentProgress;
      }
    };
  }
};

/**
 * Camera animation utilities
 */
export const cameraUtils = {
  /**
   * Smoothly move camera to target position
   */
  moveToPosition(camera, targetPosition, duration = 1500) {
    return splineObjectUtils.animatePosition(camera, targetPosition, duration, easingFunctions.easeInOutCubic);
  },

  /**
   * Orbit camera around a target point
   */
  orbitAroundTarget(camera, target, radius, angleStart, angleEnd, duration = 2000) {
    return {
      duration,
      easing: easingFunctions.easeInOutQuad,
      update: (progress) => {
        const angle = angleStart + (angleEnd - angleStart) * progress;
        camera.position.x = target.x + Math.cos(angle) * radius;
        camera.position.z = target.z + Math.sin(angle) * radius;

        // Look at target
        if (camera.lookAt) {
          camera.lookAt(target.x, target.y, target.z);
        }
      }
    };
  },

  /**
   * Shake camera for impact effects
   */
  shakeCamera(camera, intensity = 0.1, duration = 500) {
    const originalPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    return {
      duration,
      easing: easingFunctions.easeOutQuart,
      update: (progress) => {
        const shake = intensity * (1 - progress);
        camera.position.x = originalPosition.x + (Math.random() - 0.5) * shake;
        camera.position.y = originalPosition.y + (Math.random() - 0.5) * shake;
        camera.position.z = originalPosition.z + (Math.random() - 0.5) * shake;
      },
      onComplete: () => {
        camera.position.x = originalPosition.x;
        camera.position.y = originalPosition.y;
        camera.position.z = originalPosition.z;
      }
    };
  }
};

/**
 * Scroll-based animation calculations
 */
export const scrollAnimationUtils = {
  /**
   * Convert scroll progress to rotation values
   */
  scrollToRotation(progress, rotationAmplitude = { x: 0.3, y: Math.PI * 2, z: 0.1 }) {
    return {
      x: Math.sin(progress * Math.PI) * rotationAmplitude.x,
      y: progress * rotationAmplitude.y,
      z: Math.cos(progress * Math.PI * 2) * rotationAmplitude.z
    };
  },

  /**
   * Convert scroll progress to scale values
   */
  scrollToScale(progress, scaleRange = { min: 0.8, max: 1.2 }) {
    const scale = scaleRange.min + (scaleRange.max - scaleRange.min) * Math.sin(progress * Math.PI);
    return { x: scale, y: scale, z: scale };
  },

  /**
   * Convert scroll progress to position offset
   */
  scrollToPosition(progress, positionAmplitude = { x: 2, y: 1, z: 1 }) {
    return {
      x: Math.sin(progress * Math.PI * 2) * positionAmplitude.x,
      y: Math.sin(progress * Math.PI) * positionAmplitude.y,
      z: Math.cos(progress * Math.PI * 2) * positionAmplitude.z
    };
  },

  /**
   * Create wave motion based on scroll
   */
  scrollToWaveMotion(progress, frequency = 3, amplitude = 1) {
    return Math.sin(progress * Math.PI * frequency) * amplitude;
  },

  /**
   * Create spiral motion based on scroll
   */
  scrollToSpiralMotion(progress, radius = 2, height = 3) {
    const angle = progress * Math.PI * 4;
    return {
      x: Math.cos(angle) * radius * (1 - progress * 0.5),
      y: progress * height,
      z: Math.sin(angle) * radius * (1 - progress * 0.5)
    };
  }
};

/**
 * Lighting animation utilities
 */
export const lightingUtils = {
  /**
   * Animate light intensity
   */
  animateIntensity(light, targetIntensity, duration = 1000) {
    if (!light) return null;

    const startIntensity = light.intensity;

    return {
      duration,
      easing: easingFunctions.easeInOutQuad,
      update: (progress) => {
        light.intensity = startIntensity + (targetIntensity - startIntensity) * progress;
      }
    };
  },

  /**
   * Create pulsing light effect
   */
  createPulse(light, minIntensity = 0.3, maxIntensity = 1.0, pulseSpeed = 2000) {
    const baseIntensity = light.intensity;

    return {
      duration: Infinity,
      easing: easingFunctions.linear,
      update: (progress) => {
        const time = performance.now();
        const pulseProgress = (Math.sin(time / pulseSpeed * Math.PI * 2) + 1) / 2;
        light.intensity = minIntensity + (maxIntensity - minIntensity) * pulseProgress;
      }
    };
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Throttle animation updates for better performance
   */
  throttleAnimation(animationFn, fps = 30) {
    const targetInterval = 1000 / fps;
    let lastUpdate = 0;

    return (progress) => {
      const now = performance.now();
      if (now - lastUpdate >= targetInterval) {
        animationFn(progress);
        lastUpdate = now;
      }
    };
  },

  /**
   * Check if object is in viewport for optimization
   */
  isObjectInViewport(object, camera, threshold = 1.5) {
    if (!object || !camera) return true;

    // Simple distance-based culling
    const distance = Math.sqrt(
      Math.pow(object.position.x - camera.position.x, 2) +
      Math.pow(object.position.y - camera.position.y, 2) +
      Math.pow(object.position.z - camera.position.z, 2)
    );

    return distance <= threshold;
  },

  /**
   * Adaptive quality based on performance
   */
  adaptiveQuality(currentFPS, targetFPS = 60) {
    const ratio = currentFPS / targetFPS;

    if (ratio < 0.8) {
      return 'low';
    } else if (ratio < 0.9) {
      return 'medium';
    } else {
      return 'high';
    }
  }
};

/**
 * Utility function to safely find objects in Spline scene
 */
export const findObjectSafely = (splineApp, objectName, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkForObject = () => {
      try {
        const object = splineApp.findObjectByName(objectName);
        if (object) {
          resolve(object);
          return;
        }
      } catch (error) {
        // Object not found yet, continue checking
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Object "${objectName}" not found within ${timeout}ms`));
        return;
      }

      // Check again in next frame
      requestAnimationFrame(checkForObject);
    };

    checkForObject();
  });
};

/**
 * Create a comprehensive animation preset for common scroll animations
 */
export const createScrollAnimationPreset = (type, options = {}) => {
  const presets = {
    rotate: (progress) => scrollAnimationUtils.scrollToRotation(progress, options.amplitude),
    scale: (progress) => scrollAnimationUtils.scrollToScale(progress, options.range),
    float: (progress) => scrollAnimationUtils.scrollToWaveMotion(progress, options.frequency, options.amplitude),
    spiral: (progress) => scrollAnimationUtils.scrollToSpiralMotion(progress, options.radius, options.height),
    bounce: (progress) => ({
      y: Math.abs(Math.sin(progress * Math.PI * (options.bounces || 3))) * (options.height || 1)
    })
  };

  return presets[type] || presets.rotate;
};

export default {
  SplineAnimationManager,
  splineObjectUtils,
  cameraUtils,
  scrollAnimationUtils,
  lightingUtils,
  performanceUtils,
  easingFunctions,
  findObjectSafely,
  createScrollAnimationPreset
};