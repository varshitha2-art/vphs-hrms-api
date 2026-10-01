/**
 * VPHS Services Pvt. Ltd. - HRMS Mobile Login Screen
 *
 * Fully functional corporate login screen connecting to production API:
 * POST https://vphs-hrms-api.onrender.com/api/auth/login
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppConfig } from '@/constants/config';
import { loginToHrms, checkAuthStatus, logoutFromHrms, AuthenticatedUser } from '@/services/api';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  // Input refs for focus management
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
       if (isAuthenticated && user) {
  setAuthenticatedUser(user);
  router.replace('/dashboard');
}
      } catch (err) {
        console.warn('Session check failed:', err);
      }
    }
    checkSession();
  }, []);

  // Handle Login submission
  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage('Please enter your Employee ID or Username.');
      usernameInputRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginToHrms({
        username: trimmedUsername,
        password,
      });

      if (result.success && result.user) {
  setAuthenticatedUser(result.user);
  setPassword('');
  router.replace('/dashboard');
} else {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutFromHrms();
      setAuthenticatedUser(null);
      setUsername('');
      setPassword('');
      setErrorMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: Math.max(insets.bottom, 28),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* VPHS Corporate Branding Header */}
            <View style={styles.headerContainer}>
              {/* Logo Placeholder: Clean corporate monogram seal */}
              <View
                style={styles.logoPlaceholder}
                accessibilityLabel="VPHS Services Corporate Seal"
                accessibilityRole="image"
              >
                <View style={styles.logoInner}>
                  <Ionicons name="business" size={28} color="#D97706" />
                  <Text style={styles.logoMonogram}>VPHS</Text>
                </View>
              </View>

              <Text style={styles.companyName}>{AppConfig.appName}</Text>
              <Text style={styles.companyTagline}>{AppConfig.tagline}</Text>
              <View style={styles.portalBadge}>
                <Text style={styles.portalBadgeText}>OFFICIAL HRMS MOBILE PORTAL</Text>
              </View>
            </View>

            {/* Already Authenticated Session Card */}
            {authenticatedUser ? (
              <View style={styles.card}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionIconBg}>
                    <Ionicons name="checkmark-circle" size={36} color="#16A34A" />
                  </View>
                  <Text style={styles.sessionTitle}>Active Session Established</Text>
                  <Text style={styles.sessionSubtitle}>
                    You are securely authenticated with VPHS HRMS.
                  </Text>
                </View>

                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>User:</Text>
                    <Text style={styles.detailValue}>{authenticatedUser.username}</Text>
                  </View>
                  {authenticatedUser.employeeId ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Employee ID:</Text>
                      <Text style={styles.detailValue}>{authenticatedUser.employeeId}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role:</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{authenticatedUser.role}</Text>
                    </View>
                  </View>
                  {authenticatedUser.department ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Department:</Text>
                      <Text style={styles.detailValue}>{authenticatedUser.department}</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out from HRMS session"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.logoutButtonText}>Sign Out / Switch User</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Login Card */
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sign In to Account</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your VPHS employee credentials to access attendance, payslips, and roster.
                </Text>

                {/* Error Banner */}
                {errorMessage ? (
                  <View
                    style={styles.errorBanner}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <Ionicons name="alert-circle" size={20} color="#DC2626" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {/* Username / Employee ID Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Employee ID / Username</Text>
                  <Pressable
                    style={[
                      styles.inputWrapper,
                      isUsernameFocused && styles.inputWrapperFocused,
                    ]}
                    onPress={() => usernameInputRef.current?.focus()}
                    accessible={false}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={isUsernameFocused ? '#0F172A' : '#64748B'}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      ref={usernameInputRef}
                      style={styles.textInput}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setIsUsernameFocused(true)}
                      onBlur={() => setIsUsernameFocused(false)}
                      placeholder="e.g. VPHS0010 or admin"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      editable={!isLoading}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      accessibilityLabel="Employee ID or Username input field"
                      accessibilityHint="Enter your employee ID or assigned username"
                    />
                  </Pressable>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordHeaderRow}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TouchableOpacity
                      onPress={() => setShowForgotModal(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot Password option"
                    >
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  <Pressable
                    style={[
                      styles.inputWrapper,
                      isPasswordFocused && styles.inputWrapperFocused,
                    ]}
                    onPress={() => passwordInputRef.current?.focus()}
                    accessible={false}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={isPasswordFocused ? '#0F172A' : '#64748B'}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={[styles.textInput, styles.passwordInput]}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      editable={!isLoading}
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                      accessibilityLabel="Password input field"
                      accessibilityHint="Enter your account password"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword((prev) => !prev)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={showPassword ? '#0F172A' : '#64748B'}
                      />
                    </TouchableOpacity>
                  </Pressable>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isLoading || !username.trim() || !password) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading || !username.trim() || !password}
                  accessibilityRole="button"
                  accessibilityLabel="Log in to VPHS HRMS"
                  accessibilityState={{ disabled: isLoading || !username.trim() || !password }}
                >
                  {isLoading ? (
                    <View style={styles.buttonLoadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Authenticating with VPHS...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.submitButtonText}>Sign In to HRMS</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.buttonTrailingIcon} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Security Notice */}
                <View style={styles.securityNotice}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
                  <Text style={styles.securityNoticeText}>
                    256-bit encrypted enterprise session & token storage
                  </Text>
                </View>
              </View>
            )}

            {/* Corporate Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                © {new Date().getFullYear()} VPHS Services Pvt. Ltd. All rights reserved.
              </Text>
              <Text style={styles.footerSubtext}>
                Authorized Personnel Access Only • Version 1.0 (Production API)
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Guidance Modal */}
      {showForgotModal && (
        <Modal
          visible={showForgotModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowForgotModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconBg}>
                <Ionicons name="help-buoy-outline" size={32} color="#0F172A" />
              </View>

              <Text style={styles.modalTitle}>Password Reset Assistance</Text>
              <Text style={styles.modalBody}>
                For statutory compliance and biometric workforce protection, password resets
                are issued by your Site Manager or Company HR Administrator.
              </Text>

              <View style={styles.modalContactBox}>
                <View style={styles.modalContactRow}>
                  <Ionicons name="mail-outline" size={18} color="#0F172A" />
                  <Text style={styles.modalContactText}>{AppConfig.supportEmail}</Text>
                </View>
                <View style={styles.modalContactRow}>
                  <Ionicons name="call-outline" size={18} color="#0F172A" />
                  <Text style={styles.modalContactText}>{AppConfig.supportPhone}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowForgotModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close password assistance modal"
              >
                <Text style={styles.modalCloseButtonText}>Understood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // VPHS Deep Navy Primary
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 440,
  },

  /* Header Branding */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#D97706', // VPHS Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMonogram: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  companyTagline: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  portalBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 1,
  },

  /* Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },

  /* Error Banner */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Input Fields */
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  passwordInput: {
    paddingRight: 8,
  },
  passwordToggle: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Submit Button */
  submitButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonTrailingIcon: {
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },

  /* Security Notice */
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  securityNoticeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Active Session View */
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionIconBg: {
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  sessionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Footer */
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modalIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  modalContactBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  modalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalContactText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalCloseButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
