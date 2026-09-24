# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Portfolios::Generator do
  let(:org) { create(:organization) }
  let(:assessment) { create(:assessment, tenant_id: org.id) }
  let(:session_record) { create(:session, assessment: assessment, tenant_id: org.id) }
  let(:mock_gemini) { instance_double(Gemini::HttpClient) }

  let(:mock_response) do
    {
      'configured_skills' => [
        {
          'skill_id' => 'sk-1',
          'skill_label' => 'Ruby on Rails',
          'level' => 3,
          'confidence' => 'high',
          'evidence' => ['Built REST APIs with ActiveRecord'],
          'competency_summary' => 'Solid mid-level understanding.'
        }
      ],
      'discovered_skills' => []
    }.to_json
  end

  before do
    allow(mock_gemini).to receive(:generate_content).and_return(mock_response)
  end

  it 'generates a portfolio with skills parsed from Gemini response' do
    generator = described_class.new(session: session_record, gemini_client: mock_gemini)
    portfolio = generator.call

    expect(portfolio.generation_status).to eq('complete')
    expect(portfolio.portfolio_skills.count).to eq(1)

    skill = portfolio.portfolio_skills.first
    expect(skill.skill_id).to eq('sk-1')
    expect(skill.ai_level).to eq(3)
    expect(skill.ai_confidence).to eq('high')
  end

  it 'characterizes GAP P1-4: generator executes cleanly even when session transcript is completely empty' do
    expect(session_record.transcript_turns.count).to eq(0)

    generator = described_class.new(session: session_record, gemini_client: mock_gemini)
    portfolio = generator.call

    expect(portfolio.generation_status).to eq('complete')
  end
end
