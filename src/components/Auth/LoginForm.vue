<template>
  <div class="login-form">
    <div class="login-card">
      <h2>Login to Lucidifier</h2>

      <form @submit.prevent="handleLogin" class="login-form-content">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="Enter your email" class="form-input" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required placeholder="Enter your password"
            class="form-input" />
        </div>

        <button type="submit" :disabled="isLoading" class="login-button">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="login-footer">
        <p>Don't have an account? <button @click="showRegister = true" class="link-button">Register</button></p>
      </div>
    </div>

    <!-- Register Form -->
    <div v-if="showRegister" class="register-overlay">
      <div class="register-card">
        <h2>Create Account</h2>

        <form @submit.prevent="handleRegister" class="register-form-content">
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input id="reg-email" v-model="regEmail" type="email" required placeholder="Enter your email"
              class="form-input" />
          </div>

          <div class="form-group">
            <label for="reg-password">Password</label>
            <input id="reg-password" v-model="regPassword" type="password" required
              placeholder="Enter your password (min 6 characters)" class="form-input" />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input id="confirm-password" v-model="confirmPassword" type="password" required
              placeholder="Confirm your password" class="form-input" />
          </div>

          <button type="submit" :disabled="isRegistering || regPassword !== confirmPassword" class="register-button">
            {{ isRegistering ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div v-if="regError" class="error-message">
          {{ regError }}
        </div>

        <button @click="showRegister = false" class="back-button">
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import authService from '@/services/auth';

export default defineComponent({
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      regEmail: '',
      regPassword: '',
      confirmPassword: '',
      isLoading: false,
      isRegistering: false,
      error: '',
      regError: '',
      showRegister: false
    };
  },
  methods: {
    async handleLogin() {
      try {
        this.isLoading = true;
        this.error = '';

        await authService.login({
          email: this.email,
          password: this.password
        });

        // Login successful - emit event or redirect
        this.$emit('login-success');

      } catch (error: any) {
        console.error('Login error:', error);
        this.error = this.getErrorMessage(error);
      } finally {
        this.isLoading = false;
      }
    },

    async handleRegister() {
      if (this.regPassword !== this.confirmPassword) {
        this.regError = 'Passwords do not match';
        return;
      }

      if (this.regPassword.length < 6) {
        this.regError = 'Password must be at least 6 characters';
        return;
      }

      try {
        this.isRegistering = true;
        this.regError = '';

        await authService.register({
          email: this.regEmail,
          password: this.regPassword
        });

        // Registration successful - switch back to login
        this.showRegister = false;
        this.email = this.regEmail;
        this.regEmail = '';
        this.regPassword = '';
        this.confirmPassword = '';

        this.$emit('register-success');

      } catch (error: any) {
        console.error('Registration error:', error);
        this.regError = this.getErrorMessage(error);
      } finally {
        this.isRegistering = false;
      }
    },

    getErrorMessage(error: any): string {
      if (error.code === 'auth/user-not-found') {
        return 'No account found with this email address';
      }
      if (error.code === 'auth/wrong-password') {
        return 'Incorrect password';
      }
      if (error.code === 'auth/email-already-in-use') {
        return 'An account with this email already exists';
      }
      if (error.code === 'auth/weak-password') {
        return 'Password is too weak';
      }
      if (error.code === 'auth/invalid-email') {
        return 'Invalid email address';
      }
      return error.message || 'An error occurred. Please try again.';
    }
  }
});
</script>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card,
.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-card h2,
.register-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-button,
.register-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-button:hover:not(:disabled),
.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-button:disabled,
.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-button:hover {
  color: #764ba2;
}

.register-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.back-button {
  width: 100%;
  padding: 10px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
}

.back-button:hover {
  background: #5a6268;
}
</style>
