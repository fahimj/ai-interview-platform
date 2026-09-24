# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FitGap::Engine do
  let(:org) { create(:organization) }
  let(:assessment) { create(:assessment, tenant_id: org.id) }
  let(:session_record) { create(:session, assessment: assessment, tenant_id: org.id) }
  let(:portfolio) { create(:portfolio, session: session_record) }
  let(:vacancy) { create(:vacancy, tenant_id: org.id) }

  let!(:vacancy_skill1) do
    create(:vacancy_skill, vacancy: vacancy, skill_id: 'sk-1', skill_label: 'Ruby on Rails', expected_level: 3)
  end
  let!(:vacancy_skill2) do
    create(:vacancy_skill, vacancy: vacancy, skill_id: 'sk-2', skill_label: 'PostgreSQL', expected_level: 4)
  end

  let!(:portfolio_skill1) do
    create(:portfolio_skill, portfolio: portfolio, skill_id: 'sk-1', skill_label: 'Ruby on Rails', ai_level: 3)
  end
  let!(:portfolio_skill2) do
    create(:portfolio_skill, portfolio: portfolio, skill_id: 'sk-2', skill_label: 'PostgreSQL', ai_level: 2)
  end

  let(:mock_gemini) { instance_double(Gemini::HttpClient) }

  before do
    allow(mock_gemini).to receive(:generate_content).and_return({
      'culture_narrative' => 'Strong collaborative mindset.',
      'overall_narrative' => 'Recommended for mid-level position.'
    })
  end

  it 'calculates skill level comparisons and classifies results' do
    engine = described_class.new(portfolio: portfolio, vacancy: vacancy, gemini_client: mock_gemini)
    report = engine.call

    comparisons = report.skill_comparisons.map(&:deep_symbolize_keys)

    rails_comp = comparisons.find { |c| c[:skill_id] == 'sk-1' }
    expect(rails_comp[:result]).to eq('match')
    expect(rails_comp[:delta]).to eq(0)

    pg_comp = comparisons.find { |c| c[:skill_id] == 'sk-2' }
    expect(pg_comp[:result]).to eq('gap')
    expect(pg_comp[:delta]).to eq(-2)
  end

  it 'characterizes GAP P1-1: comparison payload emits expected_level (not required_level)' do
    engine = described_class.new(portfolio: portfolio, vacancy: vacancy, gemini_client: mock_gemini)
    report = engine.call

    first_comp = report.skill_comparisons.first.deep_symbolize_keys
    expect(first_comp).to have_key(:expected_level)
    expect(first_comp).not_to have_key(:required_level)
  end

  it 'falls back to deterministic narrative when Gemini client raises an error' do
    allow(mock_gemini).to receive(:generate_content).and_raise(Faraday::TimeoutError.new('timeout'))

    engine = described_class.new(portfolio: portfolio, vacancy: vacancy, gemini_client: mock_gemini)
    report = engine.call

    expect(report.culture_narrative).to be_nil
    expect(report.overall_narrative).to eq('Candidate shows 1 skill matches, 0 exceeds, and 1 gaps against role requirements.')
  end
end
