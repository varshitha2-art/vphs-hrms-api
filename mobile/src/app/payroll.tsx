import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  getMyPayslips,
  Payslip,
} from '@/services/api';

export default function PayrollScreen() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayslips = async () => {
    try {
      setError(null);

      const result = await getMyPayslips();

      if (!result.success) {
        setError(
          result.error ||
            'Unable to load your payslips.',
        );
        setPayslips([]);
        return;
      }

      setPayslips(result.payslips);
    } catch (error) {
      console.error(
        '[Payroll] Load payslips error:',
        error,
      );

      setError(
        'Unable to load your payslips.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPayslips();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayslips();
  };

  const formatCurrency = (value: number) => {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

 const formatMonth = (
  payslip: Payslip,
) => {
  const month = payslip.payroll?.payrollMonth;
  const year = payslip.payroll?.payrollYear;

  if (!month || !year) {
    return 'Payslip';
  }

  const date = new Date(
    year,
    month - 1,
    1,
  );

  return date.toLocaleString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  );
};

  const formatDate = (
    date: string | null | undefined,
  ) => {
    if (!date) {
      return 'Not paid';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not paid';
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Payroll
        </Text>

        <Text style={styles.subtitle}>
          My Payslips
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading your payslips...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Unable to load payroll
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPayslips}
          >
            <Text style={styles.retryButtonText}>
              RETRY
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {payslips.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No Payslips Available
              </Text>

              <Text style={styles.emptyText}>
                Your payslips will appear here
                when payroll has been processed.
              </Text>
            </View>
          ) : (
            payslips.map((payslip) => (
              <View
                key={payslip.id}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text
                      style={
                        styles.payslipNumber
                      }
                    >
                      {formatMonth(payslip)}
                    </Text>

                    <Text
                      style={
                        styles.payslipId
                      }
                    >
                      {payslip.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      payslip.isPaid
                        ? styles.paidBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={
                        styles.statusText
                      }
                    >
                      {payslip.isPaid
                        ? 'PAID'
                        : payslip.status ||
                          'PENDING'}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.divider}
                />

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Working Days
                  </Text>

                  <Text style={styles.value}>
                    {payslip.workingDays}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Present Days
                  </Text>

                  <Text style={styles.value}>
                    {payslip.presentDays}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Paid Leave
                  </Text>

                  <Text style={styles.value}>
                    {payslip.paidLeaveDays}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    LOP Days
                  </Text>

                  <Text style={styles.value}>
                    {payslip.lopDays}
                  </Text>
                </View>

                <View
                  style={styles.divider}
                />

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Basic Salary
                  </Text>

                  <Text style={styles.value}>
                    {formatCurrency(
                      payslip.basic,
                    )}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    HRA
                  </Text>

                  <Text style={styles.value}>
                    {formatCurrency(
                      payslip.hra,
                    )}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    DA
                  </Text>

                  <Text style={styles.value}>
                    {formatCurrency(
                      payslip.da,
                    )}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Allowances
                  </Text>

                  <Text style={styles.value}>
                    {formatCurrency(
                      payslip.grossSalary -
                        payslip.basic -
                        payslip.hra -
                        payslip.da,
                    )}
                  </Text>
                </View>

                <View
                  style={styles.divider}
                />

                <View style={styles.row}>
                  <Text style={styles.grossLabel}>
                    Gross Salary
                  </Text>

                  <Text style={styles.grossValue}>
                    {formatCurrency(
                      payslip.grossSalary,
                    )}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Total Deductions
                  </Text>

                  <Text style={styles.deductionValue}>
                    -{formatCurrency(
                      payslip.totalDeductions,
                    )}
                  </Text>
                </View>

                <View
                  style={styles.netSalaryBox}
                >
                  <Text
                    style={
                      styles.netSalaryLabel
                    }
                  >
                    NET SALARY
                  </Text>

                  <Text
                    style={
                      styles.netSalaryValue
                    }
                  >
                    {formatCurrency(
                      payslip.netSalary,
                    )}
                  </Text>
                </View>

                <View
                  style={styles.paymentInfo}
                >
                  <Text
                    style={
                      styles.paymentText
                    }
                  >
                    Payment Mode:{' '}
                    {payslip.paymentMode ||
                      'Not specified'}
                  </Text>

                  <Text
                    style={
                      styles.paymentText
                    }
                  >
                    Payment Date:{' '}
                    {formatDate(
                      payslip.paymentDate,
                    )}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#6B7280',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  payslipNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  payslipId: {
    marginTop: 4,
    fontSize: 10,
    color: '#9CA3AF',
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  paidBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },

  label: {
    fontSize: 14,
    color: '#6B7280',
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  grossLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  grossValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  deductionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },

  netSalaryBox: {
    marginTop: 14,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
  },

  netSalaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },

  netSalaryValue: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: '900',
    color: '#1D4ED8',
  },

  paymentInfo: {
    marginTop: 14,
  },

  paymentText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
});